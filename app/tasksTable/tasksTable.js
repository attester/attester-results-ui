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


angular.module("attesterTasksTable", ["attesterTaskInfoModal", "attesterExecutionStates", "attesterCampaignsManager",
        "attesterItemBox", "exportFile", "attesterMergeCampaignsConfig"]).run(["$templateCache", function($templateCache) {
        $templateCache.put("tasksTable/tasksTable.html", require("./tasksTable.html"));
    }]).directive("tasksTable", [
        "attesterTaskInfoModal",
        "AttesterExecutionStates",
        "exportFile",
        "attesterCampaignsManager",
        "mergeCampaignsConfigService",
        function (attesterTaskInfoModal, executionStates, exportFile, attesterCampaignsManager,
                mergeCampaignsConfigService) {

            var sameCampaignHeaders = function (array1, array2) {
                var l = array1.length;
                if (l != array2.length) {
                    return false;
                }
                for (var i = 0; i < l; i++) {
                    var elt1 = array1[i];
                    var elt2 = array2[i];
                    if (elt1.campaign != elt2.campaign || elt1.colspan != elt2.colspan) {
                        return false;
                    }
                }
                return true;
            };

            return {
                restrict : "E",
                templateUrl : "tasksTable/tasksTable.html",
                scope : {
                    browsersArray : "=",
                    browsersMap : "=",
                    tasksGroups : "=",
                    testURL : "=testUrl",
                    state : "="
                },
                controllerAs : "ctrl",
                controller : ["$scope", function ($scope) {
                    $scope.campaignsManager = attesterCampaignsManager;

                    if (! $scope.state) {
                        $scope.state = {};
                    }
                    var state = $scope.state;
                    if (! state.initialized) {
                        state.filterTestName = "";
                        state.filterTestState = null;
                        state.filterAll = false;
                        state.filteredBrowsers = null;
                        state.visibleBrowsers = $scope.browsersArray.slice(0);
                        state.displayInfo = "result";
                        state.pageSize = 10;
                        state.currentPage = 1;
                        state.currentSortOrder = null;
                        state.initialized = true;
                    }
                    this.tasksNumber = 0;
                    this.sortOrders = [];

                    this.mergeBrowsers = function () {
                        mergeCampaignsConfigService.addBrowserSources(state.visibleBrowsers);
                        attesterCampaignsManager.addCampaignsTabActive = true;
                    };

                    this.setSortOrder = function (selectedBrowser, sortOrder) {
                        if (!sortOrder) {
                            var displayInfo = state.displayInfo;
                            sortOrder = this.sortOrders.filter(function (sortOrder) {
                                return sortOrder.displayInfo == displayInfo;
                            })[0];
                        }
                        if (sortOrder.displayInfo) {
                            state.displayInfo = sortOrder.displayInfo;
                        }
                        var currentSortOrder = state.currentSortOrder;
                        if (currentSortOrder && currentSortOrder.browser == selectedBrowser
                                && currentSortOrder.order == sortOrder) {
                            if (currentSortOrder.reverse) {
                                currentSortOrder.reverse = false;
                            } else {
                                state.currentSortOrder = null;
                            }
                        } else {
                            state.currentSortOrder = {
                                browser : selectedBrowser,
                                order : sortOrder,
                                reverse : true,
                                sorter : function (taskGroup1, taskGroup2) {
                                    var value1 = sortOrder.getter(taskGroup1, selectedBrowser);
                                    var value2 = sortOrder.getter(taskGroup2, selectedBrowser);
                                    if (value1 > value2) {
                                        return 1;
                                    }
                                    if (value1 < value2) {
                                        return -1;
                                    }
                                    return 0;
                                }
                            };
                        }
                    };

                    this.getSortIcon = function (browser, sortOrder) {
                        var currentSortOrder = state.currentSortOrder || {};
                        if (sortOrder) {
                            if (currentSortOrder.order == sortOrder && currentSortOrder.browser == browser) {
                                return "glyphicon glyphicon glyphicon-sort-by-attributes"
                                        + (currentSortOrder.reverse ? "-alt" : "");
                            } else {
                                return "glyphicon glyphicon-empty";
                            }
                        } else {
                            if (currentSortOrder.browser == browser) {
                                return "sort-enabled glyphicon glyphicon glyphicon-sort-by-attributes"
                                        + (currentSortOrder.reverse ? "-alt" : "");
                            } else {
                                return "sort-disabled glyphicon glyphicon-sort-by-attributes-alt";
                            }
                        }
                    };

                    this.getTasks = function () {
                        var res = $scope.tasksGroups;
                        var filterTestName = state.filterTestName.toLowerCase();
                        if (filterTestName) {
                            res = res.filter(function (taskGroup) {
                                return taskGroup.name.toLowerCase().indexOf(filterTestName) > -1;
                            }, this);
                        }
                        var filterTestState = state.filterTestState;
                        if (filterTestState) {
                            var filteredBrowsers = state.filteredBrowsers;
                            var filterAll = state.filterAll;
                            var browsers = filterAll ? state.visibleBrowsers : filteredBrowsers;
                            var browsersLength = browsers.length;
                            res = res.filter(function (taskGroup) {
                                var isIncluded = !filterAll;
                                for (var i = 0; i < browsersLength; i++) {
                                    var curBrowser = browsers[i];
                                    var curState = executionStates.getTaskState(taskGroup.browsers[curBrowser.browserKey]);
                                    var filterName = curState + "-" + curBrowser.browserKey;
                                    var isFilteredBrowser = !filterAll || filteredBrowsers.indexOf(curBrowser) > -1;
                                    var isExcluded = isFilteredBrowser && !filterTestState[filterName];
                                    if (isExcluded) {
                                        return false;
                                    }
                                    if (filterAll && filterTestState[curState]) {
                                        isIncluded = true;
                                    }
                                }
                                return isIncluded;
                            });
                        }
                        var counts = this.counts = {};
                        var totalCount = counts.total = {
                            error : 0,
                            success : 0,
                            waiting : 0,
                            ignored : 0,
                            total : 0
                        };
                        state.visibleBrowsers.forEach(function (curBrowser) {
                            var curBrowserCount = {
                                error : 0,
                                success : 0,
                                waiting : 0,
                                ignored : 0,
                                total : 0
                            };
                            res.forEach(function (taskGroup) {
                                var curTaskState = executionStates.getTaskState(taskGroup.browsers[curBrowser.browserKey]);
                                curBrowserCount[curTaskState]++;
                                curBrowserCount.total++;
                            });
                            counts[curBrowser.browserKey] = curBrowserCount;
                            totalCount.error += curBrowserCount.error;
                            totalCount.success += curBrowserCount.success;
                            totalCount.waiting += curBrowserCount.waiting;
                            totalCount.ignored += curBrowserCount.ignored;
                            totalCount.total += curBrowserCount.total;
                        });
                        this.tasksNumber = res.length;
                        var currentSortOrder = state.currentSortOrder;
                        if (currentSortOrder) {
                            res = res.slice(0);
                            res.sort(currentSortOrder.sorter);
                            if (currentSortOrder.reverse) {
                                res.reverse();
                            }
                        }
                        return res;
                    };

                    this.getDisplayedTasks = function () {
                        return this.getTasks().slice((state.currentPage - 1) * state.pageSize, state.currentPage
                                * state.pageSize);
                    };

                    this.getTRClass = function (task) {
                        var browsers = task.browsers;
                        if (browsers) {
                            var allSuccess = true;
                            var allError = true;
                            var anyError = false;
                            state.visibleBrowsers.forEach(function (browser) {
                                var browserTask = browsers[browser.browserKey];
                                var lastExecution = browserTask ? browserTask.lastExecution : null;
                                if (lastExecution) {
                                    if (!lastExecution.finished || lastExecution.errors) {
                                        allSuccess = false;
                                    }
                                    if (lastExecution.errors) {
                                        anyError = true;
                                    }
                                    if (lastExecution.finished && !lastExecution.errors) {
                                        allError = false;
                                    }
                                }
                            });
                            return allSuccess ? "success" : anyError ? allError ? "danger" : "warning" : "";
                        }
                    };

                    this.getIconClass = function (task, browser) {
                        return executionStates.getTaskIcon(task.browsers[browser.browserKey]);
                    };
                    this.sortOrders.push({
                        name : "Result",
                        displayInfo : "result",
                        getter : this.getIconClass
                    });

                    this.getBadgeClass = function (task, browser) {
                        return "badge " + executionStates.getTaskState(task.browsers[browser.browserKey]);
                    };

                    this.toggleFilter = function (browser, filterState) {
                        var filterTestState = state.filterTestState;
                        if (!filterTestState) {
                            filterTestState = state.filterTestState = {};
                        }
                        var filterName = filterState + (browser ? "-" + browser.browserKey : "");
                        filterTestState[filterName] = !filterTestState[filterName];
                        this.updateFilters();
                    };

                    this.updateFilters = function () {
                        var browsersMap = $scope.browsersMap;
                        var filterTestState = state.filterTestState;
                        var filteredBrowsers = [];
                        var filterAll = false;
                        if (filterTestState) {
                            for (var filterName in filterTestState) {
                                if (filterTestState[filterName]) {
                                    var browserKey = filterName.replace(/^[a-z]+(-|$)/, "");
                                    if (browserKey) {
                                        var browser = browsersMap[browserKey];
                                        if (filteredBrowsers.indexOf(browser) == -1) {
                                            filteredBrowsers.push(browser);
                                        }
                                    } else {
                                        filterAll = true;
                                    }
                                }
                            }
                        }
                        state.filterAll = filterAll;
                        if (filterAll || filteredBrowsers.length > 0) {
                            state.filteredBrowsers = filteredBrowsers;
                        } else {
                            state.filteredBrowsers = null;
                            state.filterTestState = null;
                        }
                    };

                    this.getFilterClass = function (browser, filterState) {
                        var filterTestState = state.filterTestState;
                        var res = executionStates.getStateIcon(filterState);
                        var filterName = filterState + (browser ? "-" + browser.browserKey : "");
                        var enabled = filterTestState && filterTestState[filterName];
                        res += enabled ? " filter-enabled" : " filter-disabled";
                        return res;
                    };

                    this.toggleFilterAll = function (filterState) {
                        this.toggleFilter(null, filterState);
                    };

                    this.getFilterAllClass = function (filterState) {
                        return this.getFilterClass(null, filterState);
                    };

                    this.taskClick = function (task, browser) {
                        var browserTask = task.browsers[browser.browserKey];
                        if (browserTask) {
                            attesterTaskInfoModal({
                                task : browserTask,
                                campaign : browser.campaign
                            });
                        }
                    };

                    this.getDuration = function (task, browser) {
                        var execution = executionStates.getExecution(task.browsers[browser.browserKey]);
                        if (execution && execution.started) {
                            if (execution.finished) {
                                return (execution.finished.time - execution.started.time);
                            }
                        }
                        return -1;
                    };
                    this.sortOrders.push({
                        name : "Duration",
                        displayInfo : "duration",
                        getter : this.getDuration
                    });
                    this.getDurationText = function (task, browser) {
                        var res = this.getDuration(task, browser);
                        return res >= 0 ? res + " ms" : "";
                    };

                    this.getExecutions = function (task, browser) {
                        var browserTask = task.browsers[browser.browserKey];
                        if (browserTask) {
                            return browserTask.executions.length;
                        } else {
                            return 0;
                        }
                    };
                    this.sortOrders.push({
                        name : "Executions",
                        displayInfo : "executions",
                        getter : this.getExecutions
                    });

                    this.getErrorMsgs = function (task, browser) {
                        var execution = executionStates.getExecution(task.browsers[browser.browserKey]);
                        if (execution && execution.errors) {
                            var res = execution.errors.map(function (errorEvent) {
                                return errorEvent.error.message;
                            });
                            return res.join(", ");
                        } else {
                            return "";
                        }
                    };
                    this.sortOrders.push({
                        name : "Error messages",
                        displayInfo : "errorMsgs",
                        getter : this.getErrorMsgs
                    });

                    this.getTaskLink = function (task) {
                        return $scope.testURL + encodeURIComponent(task.name);
                    };

                    var previousCampaignHeaders = [];
                    this.getCampaignHeaders = function () {
                        var res = [];
                        var currentCampaign = null;
                        var currentHeader = null;
                        state.visibleBrowsers.forEach(function (browser) {
                            if (browser.campaign == currentCampaign) {
                                currentHeader.colspan++;
                                return;
                            }
                            currentCampaign = browser.campaign;
                            currentHeader = {
                                campaign : currentCampaign,
                                colspan : 1
                            };
                            res.push(currentHeader);
                        });
                        if (!sameCampaignHeaders(res, previousCampaignHeaders)) {
                            previousCampaignHeaders = res;
                        }
                        return previousCampaignHeaders;
                    };

                    this.exportTasks = function () {
                        var tasks = this.getTasks();
                        var testURL = $scope.testURL;
                        var doc = [];
                        doc.push('<!doctype html><html><head><title>Attester results</title></head><body><ol>');
                        tasks.forEach(function (task) {
                            doc.push('<li>')
                            if (testURL) {
                                doc.push('<a href="' + encodeURI(this.getTaskLink(task)) + '">');
                            }
                            doc.push(task.name);
                            if (testURL) {
                                doc.push('</a>');
                            }
                            doc.push('</li>');
                        }, this);
                        doc.push("</ol></body></html>");
                        exportFile(doc, {
                            type : "text/html"
                        }, "tests.html");
                    };

                    this.toggleBrowser = function (browser) {
                        var visibleBrowsers = state.visibleBrowsers;
                        var index = visibleBrowsers.indexOf(browser);
                        if (index > -1) {
                            visibleBrowsers.splice(index, 1);
                        } else {
                            state.visibleBrowsers = $scope.browsersArray.filter(function (curBrowser) {
                                return curBrowser === browser || visibleBrowsers.indexOf(curBrowser) != -1;
                            });
                        }
                    };
                }]
            };
        }]);
