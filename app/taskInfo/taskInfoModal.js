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

angular.module("attesterTaskInfoModal", ["attesterTaskInfo"]).factory("attesterTaskInfoModal", ["$uibModal",
        function ($uibModal) {
            var taskInfoModalController = ["config", function (config) {
                        this.task = config.task;
                        this.campaign = config.campaign;
                        this.execution = config.execution;
                    }];

            return function (config) {
                $uibModal.open({
                    templateUrl : 'taskInfo/taskInfoModal.html',
                    controllerAs : "ctrl",
                    controller : taskInfoModalController,
                    resolve : {
                        config : function () {
                            return config;
                        }
                    },
                    size : "lg"
                });
            }
        }]);
