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

angular.module("attesterCampaignChooser", ["attesterLiveCampaign", "attesterCampaign"]).directive("campaignChooser", [
        "$http", "AttesterLiveCampaign", "AttesterCampaign", function ($http, AttesterLiveCampaign, AttesterCampaign) {

            return {
                restrict : "E",
                scope : {
                    serverURL : "=serverUrl",
                    reportURL : "=reportUrl",
                    onSelect : "&"
                },
                templateUrl : "campaignChooser/campaignChooser.html",
                controllerAs : "ctrl",
                controller : ["$scope", function ($scope) {
                            this.serverURL = $scope.serverURL || "";
                            this.reportURL = $scope.reportURL || "";

                            var processFile = function (file) {
                                var sourceObject = {
                                    type : "file",
                                    file : file.name
                                };
                                var reader = new FileReader();
                                reader.onload = function () {
                                    var text = reader.result;
                                    $scope.$apply(processReportContent.bind(null, sourceObject, text));
                                };
                                reader.readAsText(file);
                                $scope.onSelect({
                                    $source : sourceObject
                                });
                            };

                            var processServerURL = function (serverURL) {
                                var liveCampaign = new AttesterLiveCampaign(serverURL);
                                $scope.onSelect({
                                    $source : liveCampaign
                                });
                            };

                            var processReportURL = function (reportURL) {
                                var sourceObject = {
                                    type : "reportURL",
                                    reportURL : reportURL
                                };
                                $http({
                                    url : reportURL,
                                    method : "GET",
                                    transformResponse : []
                                }).success(function (data, status, headers, config) {
                                    processReportContent(sourceObject, data);
                                }).error(function (data) {
                                    data = data || "";
                                    sourceObject.error = "Error while downloading the report. " + data;
                                });
                                $scope.onSelect({
                                    $source : sourceObject
                                });
                            };

                            var processReportContent = function (sourceObject, sourceContent) {
                                sourceContent = sourceContent.trim();
                                if (sourceContent.charAt(sourceContent.length - 1) != ']') {
                                    sourceContent = sourceContent + ']';
                                }
                                try {
                                    var data = JSON.parse(sourceContent);
                                    var campaign = sourceObject.campaign = new AttesterCampaign();
                                    campaign.addEvents(data);
                                } catch (e) {
                                    sourceObject.error = "Error while reading the report: " + e;
                                }
                            };

                            this.drop = function (dataTransfer) {
                                var files = dataTransfer.files;
                                if (files && files.length > 0) {
                                    for (var i = 0, l = files.length; i < l; i++) {
                                        processFile(files[i]);
                                    }
                                    return;
                                }
                                var url = dataTransfer.getData("URL");
                                if (url) {
                                    processReportURL(url);
                                    return;
                                }
                            };

                            this.submitLiveServer = function () {
                                processServerURL(this.serverURL);
                            };

                            this.submitRecordedLog = function () {
                                processReportURL(this.reportURL);
                            };
                        }]
            };
        }]);
