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
    var campaignKey = 0;

    var AttesterCampaign = function () {
        campaignKey++;
        // campaignKey is unique among all loaded campaigns:
        this.campaignKey = campaignKey;
        this.events = [];
        this.campaignId = null;
        this.tasksMap = null;
        this.tasksTree = null;
        this.tasksGroups = null;
        this.browsersArray = null;
        this.browsersMap = null;
        this.slavesMap = null;
        this.slavesArray = null;
        this.mergeInfo = null;
        this.lastUpdate = null;
        this.contentAsString = null;
        this.blobURL = null;
    };

    var getBrowser = function (browserName) {
        var browserKey = this.campaignKey + "-" + browserName;
        var browser = this.browsersMap[browserKey];
        if (!browser) {
            browser = this.browsersMap[browserKey] = {
                name : browserName,
                campaign : this,
                browserKey : browserKey,
                slaves : {}
            };
            this.browsersArray.push(browser);
        }
        return browser;
    };

    var initLeafTask = function (parentTask, taskDef) {
        var taskName = taskDef.taskName;
        var browserName = taskDef.browserName || "default";
        if (!taskName) {
            // backward compatibility
            taskName = taskDef.name;
            var splitName = /^(.+) on (.+)$/.exec(taskName);
            if (splitName) {
                taskName = splitName[1];
                browserName = splitName[2];
            }
        }
        var taskGroup = {
            name : taskName
        };
        if (parentTask && parentTask.name == taskName) {
            // parentTask contains the same task for different browsers
            taskGroup = parentTask;
        }
        var lastExecution = {
            state : "waiting",
            indexInTask : 0,
            events : []
        };
        var task = {
            name : taskName + " on " + browserName,
            browser : getBrowser.call(this, browserName),
            taskGroup : taskGroup,
            lastExecution : lastExecution,
            executions : [lastExecution]
        };
        lastExecution.task = task;
        var browserKey = task.browser.browserKey;
        var taskGroupBrowsers = taskGroup.browsers;
        if (!taskGroupBrowsers) {
            taskGroupBrowsers = taskGroup.browsers = {};
            this.tasksGroups.push(taskGroup);
        }
        if (taskGroupBrowsers[browserKey]) {
            console.error("Duplicate task (" + task.taskId + ") for browser " + browserName);
        } else {
            taskGroupBrowsers[browserKey] = task;
        }
        return task;
    };

    var processTask = function (parentTask, task) {
        var subTasks = task.subTasks;
        if (subTasks) {
            subTasks.forEach(processTask.bind(this, {
                // pass a copy of the parent task, so that it can be modified,
                // and the original event is not changed
                name : task.name
            }));
        }
        var taskId = task.taskId;
        if (taskId != null) {
            var tasksMap = this.tasksMap;
            if (tasksMap[taskId]) {
                console.error("Duplicate task id: " + taskId);
            } else {
                tasksMap[taskId] = initLeafTask.call(this, parentTask, task);
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
        lastExecution.events.push(event);
        return task;
    };

    var getLastExecution = function (event) {
        if (queueAfterTasksList.call(this, event)) {
            return;
        }
        var task = this.tasksMap[event.taskId];
        if (!task) {
            console.log("Missing task id: " + event.taskId);
            return;
        }
        return task.lastExecution;
    };

    var getSlave = function (slaveInfo) {
        var slaveKey = slaveInfo.address + ":" + slaveInfo.port + ":" + slaveInfo.userAgent;
        var slave = this.slavesMap[slaveKey];
        if (!slave) {
            slave = this.slavesMap[slaveKey] = {
                slaveKey : slaveKey,
                address : slaveInfo.address,
                port : slaveInfo.port,
                userAgent : slaveInfo.userAgent,
                executions : []
            };
            this.slavesArray.push(slave);
        }
        if (slaveInfo.addressName && !slave.addressName) {
            slave.addressName = slaveInfo.addressName;
        }
        return slave;
    };

    var processEvents = {
        "tasksList" : function (event) {
            this.campaignId = event.campaignId;
            this.mergeInfo = event.mergeInfo;
            this.browsersArray = [];
            this.browsersMap = {};
            this.tasksGroups = [];
            this.tasksMap = {};
            this.slavesMap = {};
            this.slavesArray = [];
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
            var task = storeTaskStateChangingEvent.call(this, event, "started");
            if (!task) {
                return;
            }
            var lastExecution = task.lastExecution;
            if (!event.slave) {
                return;
            }
            var slave = getSlave.call(this, event.slave);
            if (!task.browser.slaves[slave.slaveKey]) {
                task.browser.slaves[slave.slaveKey] = slave;
            }
            var indexInSlave = slave.executions.length;
            slave.executions[indexInSlave] = lastExecution;
            lastExecution.slave = slave;
            lastExecution.indexInSlave = indexInSlave;
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
                var indexInTask = task.executions.length;
                task.lastExecution = {
                    state : "waiting",
                    task : task,
                    indexInTask : indexInTask,
                    events : []
                };
                task.executions[indexInTask] = task.lastExecution;
            }
        },
        "error" : function (event) {
            var lastExecution = getLastExecution.call(this, event);
            if (!lastExecution) {
                return;
            }
            if (!lastExecution.errors) {
                lastExecution.errors = [];
            }
            lastExecution.events.push(event);
            lastExecution.errors.push(event);
            var testId = event.testId;
            if (testId) {
                var testsMap = lastExecution.testsMap;
                var currentTest = testsMap && testsMap[testId];
                if (!currentTest) {
                    console.log("error: Missing test id " + testId + " in task " + event.taskId);
                    return;
                }
                if (!currentTest.errors) {
                    currentTest.errors = [];
                }
                currentTest.errors.push(event);
            }
        },
        "log" : function (event) {
            var lastExecution = getLastExecution.call(this, event);
            if (!lastExecution) {
                return;
            }
            if (!lastExecution.logs) {
                lastExecution.logs = [];
            }
            lastExecution.events.push(event);
            lastExecution.logs.push(event);
        },
        "testStarted" : function (event) {
            var lastExecution = getLastExecution.call(this, event);
            if (!lastExecution) {
                return;
            }
            var testId = event.testId;
            lastExecution.events.push(event);
            var testsMap = lastExecution.testsMap;
            if (!testsMap) {
                testsMap = lastExecution.testsMap = {};
            }
            if (testsMap[testId]) {
                console.log("testStarted: Duplicate test id " + testId + " for task " + event.taskId);
                return;
            }
            var currentTest = {
                testId : testId,
                name : event.name,
                method : event.method,
                started : event
            };
            var parent = lastExecution;
            var parentTestId = event.parentTestId;
            if (parentTestId) {
                parent = testsMap[parentTestId];
                if (!parent || parent.finished) {
                    console.log("testStarted: Missing unfinished parent test " + parentTestId + " for test " + testId
                            + " in task " + event.taskId);
                    return;
                }
            }
            var testsArray = parent.tests;
            if (!testsArray) {
                testsArray = parent.tests = [];
            }
            testsMap[testId] = currentTest;
            testsArray.push(currentTest);
        },
        "testFinished" : function (event) {
            var lastExecution = getLastExecution.call(this, event);
            if (!lastExecution) {
                return;
            }
            lastExecution.events.push(event);
            var testsMap = lastExecution.testsMap || {};
            var currentTest = testsMap[event.testId];
            if (!currentTest || currentTest.finished) {
                console.log("testFinished: Missing unfinished test " + event.testId + " in task " + event.taskId);
                return;
            }
            currentTest.finished = event;
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
        this.clearCachedContent();
        this.events.push(event);
        if (!/^(test|error$)/.test(eventName) && (!this.mergeInfo || !this.lastUpdate)) {
            // events whose name start with "test" and the error event can use the clock of the slave,
            // which may differ from the one of the server
            // merged reports have their events in a non-chronological order
            if (event.time < this.lastUpdate) {
                console.log("Regression in time, passing from " + this.lastUpdate + " to " + event.time);
            }
            this.lastUpdate = event.time;
        }
    };

    AttesterCampaign.prototype.clearCachedContent = function () {
        this.contentAsString = null;
        if (this.blobURL) {
            URL.revokeObjectURL(this.blobURL);
            this.blobURL = null;
        }
    };

    AttesterCampaign.prototype.getContentAsString = function () {
        if (!this.contentAsString) {
            this.contentAsString = JSON.stringify(this.events);
        }
        return this.contentAsString;
    };

    AttesterCampaign.prototype.getBlobURL = function () {
        if (!this.blobURL) {
            var blob = new Blob([this.getContentAsString()], {
                type : "application/json"
            });
            this.blobURL = URL.createObjectURL(blob);
        }
        return this.blobURL;
    };

    AttesterCampaign.prototype.getDownloadURL = function () {
        if (this.campaignId) {
            return "application/json:" + this.campaignId + ".json:" + this.getBlobURL();
        }
    };

    AttesterCampaign.prototype.setContentFromString = function (sourceContent) {
        sourceContent = sourceContent.trim();
        if (sourceContent.charAt(sourceContent.length - 1) != ']') {
            sourceContent = sourceContent + ']';
        }
        var data = JSON.parse(sourceContent);
        this.addEvents(data);
        this.contentAsString = sourceContent;
    };

    return AttesterCampaign;
});
