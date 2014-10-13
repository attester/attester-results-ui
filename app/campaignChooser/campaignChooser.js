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

angular.module("attesterCampaignChooser", ["attesterLiveCampaign", "attesterCampaign"]).factory("AttesterCampaignChooser", [
        "$modal", "$http", "$rootScope", "AttesterLiveCampaign", "AttesterCampaign",
        function ($modal, $http, $rootScope, AttesterLiveCampaign, AttesterCampaign) {

            var CampaignChooserController = ["$modalInstance", "config", function ($modalInstance, config) {
                        this.serverURL = config.serverURL || "";
                        this.reportURL = config.reportURL || "";
                        this.sourceType = config.serverURL ? "serverURL" : config.reportURL ? "reportURL" : "serverURL";

                        var processFile = function (file) {
                            var sourceObject = {
                                type : "file",
                                file : file.name
                            };
                            var reader = new FileReader();
                            reader.onload = function () {
                                var text = reader.result;
                                $rootScope.$apply(processReportContent.bind(null, sourceObject, text));
                            };
                            reader.readAsText(file);
                            $modalInstance.close(sourceObject);
                        };

                        var processServerURL = function (serverURL) {
                            var liveCampaign = new AttesterLiveCampaign(serverURL);
                            $modalInstance.close(liveCampaign);
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
                            $modalInstance.close(sourceObject);
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
                            var file = dataTransfer.files[0];
                            if (file) {
                                processFile(file);
                                return;
                            }
                            var url = dataTransfer.getData("URL");
                            if (url) {
                                processReportURL(url);
                                return;
                            }
                        };

                        this.submit = function () {
                            var sourceType = this.sourceType;
                            if (sourceType == "serverURL") {
                                processServerURL(this.serverURL);
                            } else if (sourceType == "reportURL") {
                                processReportURL(this.reportURL);
                            }
                        };
                    }];

            return function (cfg) {
                return $modal.open({
                    templateUrl : "/campaignChooser/campaignChooser.html",
                    controllerAs : "ctrl",
                    controller : CampaignChooserController,
                    resolve : {
                        config : function () {
                            return cfg || {};
                        }
                    },
                    keyboard : false,
                    backdrop : "static"
                }).result;
            };
        }]);
