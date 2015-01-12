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

angular.module("attesterMergeCampaigns", ["attesterCampaign", "attesterCampaignsComparator"]).factory("attesterMergeCampaigns", [
        "AttesterCampaign", "AttesterCampaignsComparator", function (AttesterCampaign, AttesterCampaignsComparator) {

            var pad2 = function (number) {
                var res = number + "";
                if (res.length == 1) {
                    return "0" + res;
                } else {
                    return res;
                }
            };

            var createCampaignId = function (date) {
                return [date.getFullYear(), pad2(date.getMonth() + 1), pad2(date.getDate()), pad2(date.getHours()),
                        pad2(date.getMinutes()), pad2(date.getSeconds()), pad2(Math.floor(Math.random() * 100))].join('');
            };

            var nonNull = function (result) {
                return !!result;
            };

            var executionStarted = function (execution) {
                return !!execution.started;
            };

            var copyObject = function (original) {
                var res = {};
                Object.keys(original).forEach(function (key) {
                    res[key] = original[key];
                });
                return res;
            };

            var buildMergeInfo = function (config) {
                return {
                    keepExecutions : config.keepExecutions,
                    browsers : config.browsers.map(function (browserConfig) {
                        return {
                            name : browserConfig.name,
                            sources : browserConfig.sources.map(function (browser) {
                                return {
                                    campaignId : browser.campaign.campaignId,
                                    browserName : browser.name
                                };
                            })
                        };
                    })
                };
            };

            var getExecutionsEvents = function (taskId, executions) {
                var res = [];
                executions.forEach(function (curExecution) {
                    if (res.length > 0) {
                        var lastEvent = res[res.length - 1];
                        if (lastEvent.event != "taskFinished") {
                            console.log("Expected taskFinished event and found: " + lastEvent.event);
                        }
                        lastEvent.restartPlanned = true;
                    }
                    curExecution.events.forEach(function (curEvent) {
                        curEvent = copyObject(curEvent);
                        curEvent.taskId = taskId;
                        res.push(curEvent);
                    });
                });
                if (res.length > 0) {
                    var lastEvent = res[res.length - 1];
                    if (lastEvent.event == "taskFinished") {
                        lastEvent.restartPlanned = false;
                    }
                }
                return res;
            };

            var AllExecutionsMerge = function (taskId) {
                // keep all executions
                this.taskId = taskId;
                this.allExecutions = [];
                this.waitingExecution = null;
                this.ignoredExecution = null;
            };

            AllExecutionsMerge.prototype.merge = function (taskExecutions) {
                var newExecutions = taskExecutions.filter(function (execution) {
                    if (execution.started) {
                        return true; // only keep actual executions
                    } else if (execution.ignored) {
                        this.ignoredExecution = execution; // know about ignored executions
                    } else {
                        this.waitingExecution = execution;
                    }
                    return false;
                }, this);
                if (newExecutions.length > 0) {
                    var allExecutions = this.allExecutions;
                    allExecutions.push.apply(allExecutions, newExecutions);
                }
            };

            AllExecutionsMerge.prototype.getEvents = function () {
                var allExecutions = this.allExecutions;
                if (allExecutions.length > 0) {
                    return getExecutionsEvents(this.taskId, allExecutions);
                } else if (this.waitingExecution) {
                    return [];
                } else if (this.ignoredExecution) {
                    return getExecutionsEvents(this.taskId, [this.ignoredExecution]);
                }
                return null;
            };

            var LastExecutionsGroupMerge = function (taskId) {
                this.taskId = taskId;
                this.lastExecutions = null;
                this.lastExecutionsStarted = false;
            };

            LastExecutionsGroupMerge.prototype.merge = function (taskExecutions) {
                var lastExecutionsStarted = this.lastExecutionsStarted;
                var currentExecutionsStarted = taskExecutions.some(executionStarted);
                var keepExecutions = !lastExecutionsStarted || currentExecutionsStarted;
                if (keepExecutions) {
                    this.lastExecutions = taskExecutions;
                    this.lastExecutionsStarted = currentExecutionsStarted;
                }
            };

            LastExecutionsGroupMerge.prototype.getEvents = function () {
                if (this.lastExecutions) {
                    return getExecutionsEvents(this.taskId, this.lastExecutions);
                }
                return null;
            };

            var LastExecutionMerge = function (taskId) {
                this.taskId = taskId;
                this.lastExecution = null;
                this.waitingExecution = null;
                this.ignoredExecution = null;
            };

            LastExecutionMerge.prototype.merge = function (taskExecutions) {
                taskExecutions.forEach(function (execution) {
                    if (execution.started) {
                        this.lastExecution = execution;
                    } else if (execution.ignored) {
                        this.ignoredExecution = execution; // know about ignored executions
                    } else {
                        this.waitingExecution = execution;
                    }
                }, this);
            };

            LastExecutionMerge.prototype.getEvents = function () {
                if (this.lastExecution) {
                    return getExecutionsEvents(this.taskId, [this.lastExecution]);
                } else if (this.waitingExecution) {
                    return [];
                } else if (this.ignoredExecution) {
                    return getExecutionsEvents(this.taskId, [this.ignoredExecution]);
                }
                return null;
            };

            var keepExecutions = {
                "all" : AllExecutionsMerge,
                "lastGroup" : LastExecutionsGroupMerge,
                "lastOne" : LastExecutionMerge
            };

            var checkBrowserNames = function (browsers) {
                var names = {};
                browsers.forEach(function (browserDef) {
                    var browserName = browserDef.name;
                    if (names[browserName] === 1) {
                        throw new Error("Duplicate browser name: " + browserName);
                    }
                    names[browserName] = 1;
                });
            };

            var mergeCampaigns = function (config) {
                var ExecutionsMerge = keepExecutions[config.keepExecutions];
                if (!ExecutionsMerge) {
                    throw new Error("Invalid value for keepExecutions");
                }
                var newBrowserDefinitions = config.browsers;
                checkBrowserNames(newBrowserDefinitions);
                var oldBrowsers = [];
                newBrowserDefinitions.forEach(function (curBrowser) {
                    curBrowser.sources.forEach(function (originalBrowser) {
                        oldBrowsers.push(originalBrowser);
                    });
                });
                var comparison = new AttesterCampaignsComparator(oldBrowsers);
                var taskIdCounter = 0;
                var events = [];
                var tasksList = comparison.tasksGroups.map(function (taskGroup) {
                    var taskName = taskGroup.name;
                    return {
                        name : taskName,
                        subTasks : newBrowserDefinitions.map(function (browserDefinition) {
                            var taskId = taskIdCounter;
                            var taskExecutions = new ExecutionsMerge(taskId);
                            browserDefinition.sources.forEach(function (oldBrowser) {
                                var taskInfo = taskGroup.browsers[oldBrowser.browserKey];
                                if (taskInfo && taskInfo.executions) {
                                    taskExecutions.merge(taskInfo.executions);
                                }
                            });
                            var taskEvents = taskExecutions.getEvents();
                            if (!taskEvents) {
                                return;
                            }
                            if (taskEvents.length > 0) {
                                events.push.apply(events, taskEvents);
                            }
                            taskIdCounter++;
                            return {
                                name : taskName + " on " + browserDefinition.name,
                                taskName : taskName,
                                browserName : browserDefinition.name,
                                taskId : taskId
                            };
                        }).filter(nonNull)
                    }
                });
                var res = new AttesterCampaign();
                var now = new Date();
                res.addEvent({
                    event : "tasksList",
                    campaignId : createCampaignId(now),
                    tasks : tasksList,
                    mergeInfo : buildMergeInfo(config),
                    time : now.getTime()
                });
                res.addEvents(events);
                res.addEvent({
                    event : "campaignFinished",
                    time : now.getTime()
                });
                return res;
            };

            return mergeCampaigns;
        }]);
