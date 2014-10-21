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

(function () {
    var app = angular.module("attester-ui", ["attesterTasksTable", "attesterCampaignChooser", "ui.bootstrap",
            "dragdrop"]);

    app.controller("MainViewController", ["$http", function ($http) {
                var ctrl = this;

                ctrl.sources = [];
                ctrl.addSource = function (source) {
                    ctrl.sources.push(source);
                    source.active = true;
                };
                ctrl.removeSource = function (index) {
                    var source = ctrl.sources[index];
                    if (source.disconnect) {
                        source.disconnect();
                    }
                    ctrl.sources.splice(index, 1);
                };
                $http.get("/config.json").success(function (config) {
                    ctrl.config = config;
                });
            }]);
})();