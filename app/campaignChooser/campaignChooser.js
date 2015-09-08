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

angular.module("attesterCampaignChooser", ["textFieldSuggestions", "attesterCampaignsManager"]).directive("campaignChooser", [
        "attesterCampaignsManager", "$http", function (campaignsManager, $http) {

            return {
                restrict : "E",
                scope : {
                    serverURL : "=serverUrl",
                    serverURLs : "=serverUrls",
                    reportURL : "=reportUrl",
                    reportURLs : "=reportUrls"
                },
                templateUrl : "campaignChooser/campaignChooser.html",
                controllerAs : "ctrl",
                controller : ["$scope", function ($scope) {
                            this.serverURL = $scope.serverURL || "";
                            this.reportURL = $scope.reportURL || "";
                            this.serverURLs = $scope.serverURLs || [];
                            this.reportURLs = $scope.reportURLs || [];
                            this.serverCampaigns = null;

                            this.submitLiveServer = function () {
                                var self = this;
                                var serverURL = this.serverURL;
                                var addressMatch = /^(https?:\/\/[^\/]*)(?:\/campaign([0-9]+))?$/.exec(serverURL);
                                var socketAddress = addressMatch ? addressMatch[1] : null;
                                var campaignId = addressMatch ? addressMatch[2] : null;
                                if (!socketAddress || campaignId) {
                                    campaignsManager.createSourceFromServerURL(serverURL).active = true;
                                    return;
                                }
                                $http.jsonp(socketAddress + "/__attester__/status.json?callback=JSON_CALLBACK").then(function (result) {
                                    var campaigns = result.data.campaigns;
                                    if (!campaigns || campaigns.length <= 1) {
                                        campaignsManager.createSourceFromServerURL(serverURL).active = true;
                                    } else {
                                        self.serverCampaigns = campaigns.map(function(campaignInfo) {
                                            campaignInfo.selected = true;
                                            campaignInfo.url = socketAddress + "/campaign" + campaignInfo.id;
                                            return campaignInfo;
                                        });
                                    }
                                }, function (failure) {
                                    // probably an old server not supporting the status.json page
                                    // falling back to the previous behavior
                                    campaignsManager.createSourceFromServerURL(serverURL).active = true;
                                });
                            };

                            this.submitServerCampaigns = function () {
                                var firstTab = true;
                                this.serverCampaigns.forEach(function (campaign) {
                                    if (campaign.selected) {
                                        var tab = campaignsManager.createSourceFromServerURL(campaign.url);
                                        if (firstTab) {
                                            firstTab = false;
                                            tab.active = true;
                                        }
                                    }
                                });
                                this.serverCampaigns = null;
                            };

                            this.submitRecordedLog = function () {
                                campaignsManager.createSourceFromReportURL(this.reportURL).active = true;
                            };

                            this.drop = function (dragSource) {
                                campaignsManager.drop(dragSource);
                            }
                        }]
            };
        }]);
