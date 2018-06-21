/*
 * Copyright 2018 Amadeus s.a.s.
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

angular
  .module("attesterRunningSlavesInfo", ["attesterTaskInfoModal", "attesterExecutionStates"])
  .run([
    "$templateCache",
    function($templateCache) {
      $templateCache.put(
        "runningSlavesInfo/runningSlavesInfo.html",
        require("./runningSlavesInfo.html")
      );
    }
  ])
  .directive("runningSlavesInfo", [
    function() {
      return {
        restrict: "E",
        scope: {
            source: "="
        },
        templateUrl: "runningSlavesInfo/runningSlavesInfo.html",
        controllerAs: "ctrl",
        controller: ["$scope", "attesterTaskInfoModal", "AttesterExecutionStates", function($scope, attesterTaskInfoModal, executionStates) {
            this.lastExecutions = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
            this.executionClick = function (execution) {
                if (execution) {
                    attesterTaskInfoModal({
                        task : execution.task,
                        execution: execution,
                        campaign : $scope.source.campaign
                    });
                }
            };
            this.getIconClass = function (execution) {
                return execution ? executionStates.getExecutionIcon(execution) : '';
            };
        }]
      };
    }
  ]);
