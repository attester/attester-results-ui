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

angular.module("attesterTasksTable", ["attesterTaskInfoModal", "attesterExecutionStates", "exportFile"]).directive("tasksTable", [
        "attesterTaskInfoModal", "AttesterExecutionStates", "exportFile",
        function (attesterTaskInfoModal, executionStates, exportFile) {

            return {
                restrict : "E",
                templateUrl : "/tasksTable/tasksTable.html",
                scope : {
                    browsersArray : "=",
                    browsersMap : "=",
                    tasksGroups : "=",
                    testURL : "="
                },
                controllerAs : "ctrl",
                controller : ["$scope", function ($scope) {
                    this.filterTestName = "";
                    this.filterTestState = null;
                    this.filterAll = false;
                    this.filteredBrowsers = null;
                    this.tasksNumber = 0;
                    this.pageSize = 10;
                    this.currentPage = 1;

                    this.getTasks = function () {
                        var res = $scope.tasksGroups;
                        var filterTestName = this.filterTestName.toLowerCase();
                        if (filterTestName) {
                            res = res.filter(function (taskGroup) {
                                return taskGroup.name.toLowerCase().indexOf(filterTestName) > -1;
                            }, this);
                        }
                        var filterTestState = this.filterTestState;
                        if (filterTestState) {
                            var filteredBrowsers = this.filteredBrowsers;
                            var filterAll = this.filterAll;
                            var browsers = filterAll ? $scope.browsersArray : filteredBrowsers;
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
                        this.tasksNumber = res.length;
                        return res;
                    };

                    this.getDisplayedTasks = function () {
                        return this.getTasks().slice((this.currentPage - 1) * this.pageSize, this.currentPage
                                * this.pageSize);
                    };

                    this.getTRClass = function (task) {
                        var browsers = task.browsers;
                        if (browsers) {
                            var allSuccess = true;
                            var allError = true;
                            var anyError = false;
                            $scope.browsersArray.forEach(function (browser) {
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

                    this.toggleFilter = function (browser, state) {
                        var filterTestState = this.filterTestState;
                        if (!filterTestState) {
                            filterTestState = this.filterTestState = {};
                        }
                        var filterName = state + (browser ? "-" + browser.browserKey : "");
                        filterTestState[filterName] = !filterTestState[filterName];
                        this.updateFilters();
                    };

                    this.updateFilters = function () {
                        var browsersMap = $scope.browsersMap;
                        var filterTestState = this.filterTestState;
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
                        this.filterAll = filterAll;
                        if (filterAll || filteredBrowsers.length > 0) {
                            this.filteredBrowsers = filteredBrowsers;
                        } else {
                            this.filteredBrowsers = null;
                            this.filterTestState = null;
                        }
                    };

                    this.getFilterClass = function (browser, state) {
                        var filterTestState = this.filterTestState;
                        var res = executionStates.getStateIcon(state);
                        var filterName = state + (browser ? "-" + browser.browserKey : "");
                        var enabled = filterTestState && filterTestState[filterName];
                        res += enabled ? " filter-enabled" : " filter-disabled";
                        return res;
                    };

                    this.toggleFilterAll = function (state) {
                        this.toggleFilter(null, state);
                    };

                    this.getFilterAllClass = function (state) {
                        return this.getFilterClass(null, state);
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

                    this.getTaskLink = function (task) {
                        return $scope.testURL + encodeURIComponent(task.name);
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
                }]
            };
        }]);