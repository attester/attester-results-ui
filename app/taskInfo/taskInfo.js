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

angular.module("attesterTaskInfo", ["attesterExecutionStates", "attesterTestsDetails"]).directive("taskInfo", [
        "AttesterExecutionStates", function (executionStates) {

            return {
                restrict : "E",
                templateUrl : "taskInfo/taskInfo.html",
                scope : {
                    task : "=",
                    campaign : "=",
                    execution : "="
                },
                controllerAs : "ctrl",
                controller : ["$scope", function ($scope) {
                    this.currentExecution = function (execution) {
                        if (execution) {
                            $scope.execution = execution;
                            $scope.task = execution.task;
                        }
                        return $scope.execution;
                    };

                    this.indexInSlave = function (value) {
                        var currentExecution = this.currentExecution();
                        if (value) {
                            currentExecution = this.currentExecution(currentExecution.slave.executions[value - 1]);
                        }
                        return currentExecution.indexInSlave + 1;
                    };

                    this.currentExecution($scope.execution || executionStates.getExecution($scope.task));

                    this.getSlaveAddress = function (execution) {
                        var res = [];
                        var slave = execution.slave;
                        if (slave.addressName) {
                            res.push(slave.addressName, ":", slave.port, " (", slave.address, ")");
                        } else {
                            res.push(slave.address, ":", slave.port);
                        }
                        return res.join("");
                    };

                    this.getState = function (execution) {
                        return executionStates.getExecutionState(execution);
                    };

                    this.getStateIcon = function (execution) {
                        return executionStates.getExecutionIcon(execution);
                    };

                    this.getDuration = function (execution) {
                        var startedTime = execution.started.time;
                        var finished = execution.finished || {
                            time : $scope.campaign.lastUpdate
                        };
                        return finished.time - startedTime;
                    };

                    this.getExecutionLabel = function (execution) {
                        var res = [];
                        var started = execution.started;
                        if (started) {
                            res.push(new Date(started.time).toLocaleString(), " on ", started.slave.addressName
                                    || started.slave.address, ":", started.slave.port);
                        } else if (execution.ignored) {
                            res.push("skipped");
                        } else {
                            res.push("waiting to be executed");
                        }
                        if (execution.errors) {
                            res.push(", ", execution.errors.length, " error(s)");
                        } else if (execution.finished) {
                            res.push(", success");
                        }
                        return res.join("");
                    };
                }]
            };
        }]);
