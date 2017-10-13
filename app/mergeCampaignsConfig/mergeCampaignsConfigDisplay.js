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

angular.module("attesterMergeCampaignsConfigDisplay", ["attesterItemBox", "attesterCampaignsManager"]).run(["$templateCache", function($templateCache) {
    $templateCache.put("mergeCampaignsConfig/mergeCampaignsConfigDisplay.html", require("./mergeCampaignsConfigDisplay.html"));
}]).directive("mergeCampaignsConfigDisplay", [
        "attesterCampaignsManager", function (attesterCampaignsManager) {

            return {
                restrict : "E",
                scope : {
                    "config" : "="
                },
                templateUrl : "mergeCampaignsConfig/mergeCampaignsConfigDisplay.html",
                controllerAs : "ctrl",
                controller : ["$scope", function ($scope) {
                            this.getColor = attesterCampaignsManager.getCampaignColorById;

                            this.getCampaigns = function () {
                                var res = [];
                                $scope.config.browsers.forEach(function (newBrowser) {
                                    newBrowser.sources.forEach(function (sourceBrowser) {
                                        var campaignId = sourceBrowser.campaignId;
                                        if (res.indexOf(campaignId) == -1) {
                                            res.push(campaignId);
                                        }
                                    });
                                });
                                return res;
                            };

                            var keepExecutions = {
                                "lastOne" : "the last execution",
                                "lastGroup" : "the last group of executions",
                                "all" : "all executions"
                            };

                            this.getKeepExecutions = function () {
                                return keepExecutions[$scope.config.keepExecutions];
                            };
                        }]
            };
        }]);
