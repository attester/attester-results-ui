/*
 * Copyright 2014 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

angular.module("attesterCampaign", []).factory("AttesterCampaign", function () {

    var AttesterCampaign = function () {
        this.events = [];
        this.campaignId = null;
        this.tasksMap = null;
        this.tasksTree = null;
        this.tasksGroups = null;
        this.browsersArray = null;
        this.browsersMap = null;
        this.lastUpdate = null;
    };

    var getBrowser = function (browserName) {
        var browser = this.browsersMap[browserName];
        if (!browser) {
            browser = this.browsersMap[browserName] = {
                name : browserName
            };
            this.browsersArray.push(browser);
        }
        return browser;
    };

    var initLeafTask = function (parentTask, task) {
        task.lastExecution = {
            state : "waiting"
        };
        task.executions = [task.lastExecution];
        var taskName = task.name;
        var browserName = "default";
        var taskGroup = {
            name : taskName
        };
        if (parentTask) {
            var sizeBeforeBrowserName = parentTask.name.length + 4;
            if (taskName.substr(0, sizeBeforeBrowserName) == parentTask.name + " on ") {
                // parentTask contains the same task for different browsers
                browserName = taskName.substr(sizeBeforeBrowserName);
                taskGroup = parentTask;
            }
        }
        task.browser = getBrowser.call(this, browserName);
        task.taskGroup = taskGroup;
        var taskGroupBrowsers = taskGroup.browsers;
        if (!taskGroupBrowsers) {
            taskGroupBrowsers = taskGroup.browsers = {};
            this.tasksGroups.push(taskGroup);
        }
        if (taskGroupBrowsers[browserName]) {
            console.error("Duplicate task (" + task.taskId + ") for browser " + browserName);
        } else {
            taskGroupBrowsers[browserName] = task;
        }
    };

    var processTask = function (parentTask, task) {
        var subTasks = task.subTasks;
        if (subTasks) {
            subTasks.forEach(processTask.bind(this, task));
        }
        var taskId = task.taskId;
        if (taskId != null) {
            var tasksMap = this.tasksMap;
            if (tasksMap[taskId]) {
                console.error("Duplicate task id: " + taskId);
            } else {
                tasksMap[taskId] = task;
                initLeafTask.call(this, parentTask, task);
            }
        }
    };

    var stateTransitions = {
        "waiting" : {
            "started" : true,
            "ignored" : true
        },
        "started" : {
            "finished" : true
        },
        "finished" : {}
    };

    var queueAfterTasksList = function (event) {
        if (this.tasksMap) {
            return;
        }
        if (!this._queuedEvents) {
            this._queuedEvents = [];
        }
        this._queuedEvents.push(event);
        return true;
    };

    var storeTaskStateChangingEvent = function (event, property) {
        if (queueAfterTasksList.call(this, event)) {
            return;
        }
        var task = this.tasksMap[event.taskId];
        if (!task) {
            console.log("Missing task id: " + event.taskId);
            return;
        }
        var lastExecution = task.lastExecution;
        var state = lastExecution.state;
        if (!stateTransitions[state][property]) {
            console.log("Invalid transition from " + state + " to " + property + " for task " + event.taskId);
            return;
        }
        lastExecution[property] = event;
        lastExecution.state = property;
        return task;
    };

    var processEvents = {
        "tasksList" : function (event) {
            this.campaignId = event.campaignId;
            this.browsersArray = [];
            this.browsersMap = {};
            this.tasksGroups = [];
            this.tasksMap = {};
            var tasks = event.tasks;
            this.tasksTree = tasks;
            tasks.forEach(processTask.bind(this, null));
            if (this._queuedEvents) {
                this._queuedEvents.forEach(function (event) {
                    var fn = processEvents[event.event];
                    if (fn) {
                        fn.call(this, event);
                    }
                }, this);
                this._queuedEvents = null;
            }
        },
        "taskStarted" : function (event) {
            storeTaskStateChangingEvent.call(this, event, "started");
        },
        "taskIgnored" : function (event) {
            storeTaskStateChangingEvent.call(this, event, "ignored");
        },
        "taskFinished" : function (event) {
            var task = storeTaskStateChangingEvent.call(this, event, "finished");
            if (!task) {
                return;
            }
            if (event.restartPlanned) {
                task.lastExecution = {
                    state : "waiting"
                };
                task.executions.push(task.lastExecution);
            }
        },
        "error" : function (event) {
            if (queueAfterTasksList.call(this, event)) {
                return;
            }
            var task = this.tasksMap[event.taskId];
            if (!task) {
                console.log("Missing task id: " + event.taskId);
                return;
            }
            var lastExecution = task.lastExecution;
            if (!lastExecution.errors) {
                lastExecution.errors = [];
            }
            lastExecution.errors.push(event);
        }
    };

    AttesterCampaign.prototype.addEvents = function (events) {
        events.forEach(this.addEvent, this);
    };

    AttesterCampaign.prototype.addEvent = function (event) {
        var eventName = event.event;
        var fn = processEvents[eventName];
        if (fn) {
            fn.call(this, event);
        }
        this.events.push(event);
        if (!/^(test|error$)/.test(eventName)) {
            // events whose name start with "test" and the error event can use the clock of the slave,
            // which may differ from the one of the server
            if (event.time < this.lastUpdate) {
                console.log("Regression in time, passing from " + this.lastUpdate + " to " + event.time);
            }
            this.lastUpdate = event.time;
        }
    };

    return AttesterCampaign;
});
