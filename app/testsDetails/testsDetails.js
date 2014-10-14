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

angular.module("attesterTestsDetails", []).directive("testsDetails", ["$compile", function ($compile) {

            var hasError = function (test) {
                if (test.errors) {
                    return true;
                }
                var subTests = test.tests;
                if (subTests) {
                    for (var i = 0, l = subTests.length; i < l; i++) {
                        if (hasError(subTests[i])) {
                            return true;
                        }
                    }
                }
                return false;
            };

            return {
                restrict : "E",
                templateUrl : "/testsDetails/testsDetails.html",
                scope : {
                    tests : "=",
                    taskExecution : "=",
                    campaign : "="
                },
                controllerAs : "ctrl",
                controller : ["$scope", function ($scope) {
                            this.getTestClass = function (test) {
                                if (hasError(test)) {
                                    return "test-error";
                                } else if (test.finished) {
                                    return "test-success";
                                }
                            };
                            this.getDuration = function (test) {
                                var startedTime = test.started.time;
                                var testFinished = test.finished;
                                if (testFinished) {
                                    return testFinished.time - startedTime;
                                }
                                var taskExecutionFinished = $scope.taskExecution.finished;
                                if (taskExecutionFinished) {
                                    var finishedTime = taskExecutionFinished.time;
                                    var taskStartedTime = $scope.taskExecution.started.time;
                                    return finishedTime - Math.max(taskStartedTime, startedTime);
                                }
                                return Math.max(0, $scope.campaign.lastUpdate - startedTime);
                            };
                        }],
                compile : function (tElement, tAttr) {
                    var contents = tElement.contents().remove();
                    var compiledContents;
                    return function (scope, element) {
                        if (!compiledContents) {
                            compiledContents = $compile(contents);
                        }
                        compiledContents(scope, function (clone, scope) {
                            element.append(clone);
                        });
                    };
                }
            };
        }]);