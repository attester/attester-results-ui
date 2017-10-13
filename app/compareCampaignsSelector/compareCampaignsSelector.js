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

angular.module("attesterCompareCampaignsSelector", ["attesterCampaignsComparator"]).run(["$templateCache", function($templateCache) {
    $templateCache.put("compareCampaignsSelector/compareCampaignsSelector.html", require("./compareCampaignsSelector.html"));
}]).directive("compareCampaignsSelector", [
        "AttesterCampaignsComparator", function (AttesterCampaignsComparator) {

            return {
                restrict : "E",
                scope : {
                    campaigns : "=",
                    onSelect : "&"
                },
                templateUrl : "compareCampaignsSelector/compareCampaignsSelector.html",
                controllerAs : "ctrl",
                controller : ["$scope", function ($scope) {
                            this.selectedBrowsers = [];
                            this.getBrowsers = function () {
                                var res = [];
                                $scope.campaigns.forEach(function (campaign) {
                                    res.push.apply(res, campaign.browsersArray);
                                });
                                return res;
                            };
                            this.submit = function () {
                                $scope.onSelect({
                                    $comparator : new AttesterCampaignsComparator(this.selectedBrowsers)
                                });
                            };
                        }]
            };
        }]);
