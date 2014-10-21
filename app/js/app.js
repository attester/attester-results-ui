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
    var app = angular.module("attester-ui", ["attesterTasksTable", "attesterCampaignChooser",
            "attesterCompareCampaignsSelector", "ui.bootstrap", "dragdrop"]);

    var sameArray = function (array1, array2) {
        var l = array1.length;
        if (l !== array2.length) {
            return false;
        }
        for (var i = 0; i < l; i++) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    };

    app.controller("MainViewController", ["$http", function ($http) {
                var ctrl = this;

                var sources = ctrl.sources = [];
                ctrl.addSource = function (source) {
                    sources.push(source);
                    source.active = true;
                };
                ctrl.removeSource = function (index) {
                    var source = sources[index];
                    if (source.disconnect) {
                        source.disconnect();
                    }
                    sources.splice(index, 1);
                };
                var comparators = ctrl.comparators = [];
                ctrl.addComparator = function (comparator) {
                    comparators.push(comparator);
                    comparator.active = true;
                };
                ctrl.removeComparator = function (index) {
                    comparators.splice(index, 1);
                };

                var previouslyLoadedCampaigns = [];
                ctrl.getLoadedCampaigns = function () {
                    var campaigns = [];
                    for (var i = 0, l = sources.length; i < l; i++) {
                        var curCampaign = sources[i].campaign;
                        if (curCampaign && curCampaign.campaignId) {
                            campaigns.push(curCampaign);
                        }
                    }
                    // returns the same array as before if it did not change
                    // (for the stability of the data model)
                    if (!sameArray(previouslyLoadedCampaigns, campaigns)) {
                        previouslyLoadedCampaigns = campaigns;
                    }
                    return previouslyLoadedCampaigns;
                };

                $http.get("/config.json").success(function (config) {
                    ctrl.config = config;
                });
            }]);
})();