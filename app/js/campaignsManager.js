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

angular.module("attesterCampaignsManager", ["attesterLiveCampaign", "attesterCampaign"]).factory("attesterCampaignsManager", [
        "$http", "$rootScope", "AttesterLiveCampaign", "AttesterCampaign",
        function ($http, $rootScope, AttesterLiveCampaign, AttesterCampaign) {

            var createColor = function () {
                var r = Math.floor(155 + Math.random() * 100);
                var g = Math.floor(155 + Math.random() * 100);
                var b = Math.floor(155 + Math.random() * 100);
                return ["#", r.toString(16), g.toString(16), b.toString(16)].join("");
            };

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

            var manager = {};

            var sources = manager.sources = [];
            manager.addSource = function (source) {
                sources.push(source);
            };
            manager.removeSource = function (index) {
                var source = sources[index];
                if (source.disconnect) {
                    source.disconnect();
                }
                sources.splice(index, 1);
            };

            var campaignsColors = {};
            manager.getCampaignColorById = function (campaignId) {
                var res = campaignsColors[campaignId];
                if (!res) {
                    res = campaignsColors[campaignId] = createColor();
                }
                return res;
            };
            manager.getCampaignColor = function (campaignObject) {
                return manager.getCampaignColorById(campaignObject.campaignId);
            };

            var previouslyLoadedCampaigns = [];
            manager.getLoadedCampaigns = function () {
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

            var processReportContent = function (sourceObject, sourceContent) {
                try {
                    var campaign = new AttesterCampaign();
                    campaign.setContentFromString(sourceContent);
                    sourceObject.campaign = campaign;
                } catch (e) {
                    sourceObject.error = "Error while reading the report: " + e;
                }
            };

            manager.createSourceFromReportFile = function (file) {
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
                manager.addSource(sourceObject);
                return sourceObject;
            };

            manager.createSourceFromServerURL = function (serverURL) {
                // First check if the requested url is not already opened and connected:
                for (var i = 0, l = sources.length; i < l; i++) {
                    var curSource = sources[i];
                    if (curSource.type == "serverURL" && curSource.connected && curSource.serverURL == serverURL) {
                        return curSource;
                    }
                }
                var sourceObject = new AttesterLiveCampaign(serverURL);
                manager.addSource(sourceObject);
                return sourceObject;
            };

            manager.createSourceFromReportURL = function (reportURL) {
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
                manager.addSource(sourceObject);
                return sourceObject;
            };

            manager.createSourceFromReportContent = function (reportContent) {
                var source = {};
                processReportContent(source, reportContent);
                manager.addSource(source);
                return source;
            };

            manager.createSourceFromCampaignObject = function (campaign) {
                // First check if the requested campaign is not already in the list of sources
                for (var i = 0, l = sources.length; i < l; i++) {
                    var curSource = sources[i];
                    if (curSource.campaign == campaign) {
                        return curSource;
                    }
                }
                var source = {
                    campaign : campaign
                };
                manager.addSource(source);
                return source;
            };

            manager.createSourcesFromDragSource = function (dragSource) {
                if (dragSource.internalDrag) {
                    var source = dragSource.getData(manager);
                    if (source) {
                        return [source];
                    }
                    var campaign = dragSource.getData(AttesterCampaign);
                    if (campaign) {
                        return [manager.createSourceFromCampaignObject(campaign)];
                    }
                    return null;
                }
                var serverURL = dragSource.getData("application/x-attester-server");
                if (serverURL) {
                    return [manager.createSourceFromServerURL(serverURL)];
                }
                var attesterCampaign = dragSource.getData("application/x-attester-campaign-report");
                if (attesterCampaign) {
                    return [manager.createSourceFromReportContent(attesterCampaign)];
                }
                var files = dragSource.files;
                if (files && files.length > 0) {
                    var res = [];
                    for (var i = 0, l = files.length; i < l; i++) {
                        res[i] = manager.createSourceFromReportFile(files[i]);
                    }
                    return res;
                }
                var url = dragSource.getData("URL");
                if (url) {
                    return [manager.createSourceFromReportURL(url)];
                }
            };

            manager.getDragSourceFromCampaignSource = function (campaignSource) {
                var res = [{
                            type : manager,
                            value : campaignSource
                        }];
                if (campaignSource.type == "serverURL" && campaignSource.connected) {
                    res.push({
                        type : "application/x-attester-server",
                        value : campaignSource.serverURL
                    });
                }
                if (campaignSource.campaign && campaignSource.campaign.campaignId) {
                    res.push({
                        type : "application/x-attester-campaign-report",
                        value : campaignSource.campaign.getContentAsString()
                    }, {
                        type : "DownloadURL",
                        value : campaignSource.campaign.getDownloadURL()
                    });
                }
                return res;
            };

            manager.getDragSourceFromCampaign = function (campaign) {
                var res = [{
                            type : AttesterCampaign,
                            value : campaign
                        }];
                if (campaign.campaignId) {
                    res.push({
                        type : "application/x-attester-campaign-report",
                        value : campaign.getContentAsString()
                    }, {
                        type : "DownloadURL",
                        value : campaign.getDownloadURL()
                    });
                }
                return res;
            };

            manager.drop = function (dragSource) {
                var res = manager.createSourcesFromDragSource(dragSource);
                if (res) {
                    res[0].active = true;
                }
            };

            return manager;
        }]);
