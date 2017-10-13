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

angular.module("attesterMergeCampaignsConfig", ["attesterMergeCampaigns", "attesterItemBox", "attesterCampaignsManager"]).run(["$templateCache", function($templateCache) {
    $templateCache.put("mergeCampaignsConfig/mergeCampaignsConfig.html", require("./mergeCampaignsConfig.html"));
}]).factory("mergeCampaignsConfigService", [
        "$timeout", "attesterMergeCampaigns", "attesterCampaignsManager",
        function ($timeout, attesterMergeCampaigns, campaignsManager) {

            var mergeCampaignsConfigService = {};

            mergeCampaignsConfigService.mainDrop = function (dragSource) {
                var sources = campaignsManager.createSourcesFromDragSource(dragSource);
                if (sources) {
                    var waitingSources = mergeCampaignsConfigService.waitingSources;
                    waitingSources.push.apply(waitingSources, sources);
                    mergeCampaignsConfigService.refreshWaitingSources();
                }
            };

            mergeCampaignsConfigService.removeWaitingSource = function (index) {
                mergeCampaignsConfigService.waitingSources.splice(index, 1);
            };

            mergeCampaignsConfigService.refreshWaitingSources = function () {
                var curWaitingSources = mergeCampaignsConfigService.waitingSources;
                var newWaitingSources = curWaitingSources.filter(function (waitingSource) {
                    var campaign = waitingSource.campaign;
                    if (campaign) {
                        mergeCampaignsConfigService.addCampaign(campaign);
                    }
                    return !campaign;
                }, mergeCampaignsConfigService);
                if (newWaitingSources.length != curWaitingSources.length) {
                    mergeCampaignsConfigService.waitingSources = newWaitingSources;
                }
            };

            mergeCampaignsConfigService.getWaitingSources = function () {
                mergeCampaignsConfigService.refreshWaitingSources();
                return mergeCampaignsConfigService.waitingSources;
            };

            dragBrowserSourceInfo = null;
            var dragEnters = [];

            var registerDragEnter = function () {
                var res = {};
                dragEnters.push(res);
                return res;
            };
            var removeDragEnter = function (dragEnter) {
                if (dragEnter) {
                    var index = dragEnters.indexOf(dragEnter);
                    if (index > -1) {
                        dragEnters.splice(index, 1);
                        if (dragEnters.length == 0) {
                            $timeout(function () {
                                if (dragEnters.length == 0) {
                                    restoreConfig();
                                }
                            }, 10);
                        }
                    }
                }
            };

            var restoreConfig = function () {
                if (dragBrowserSourceInfo) {
                    var target = dragBrowserSourceInfo.target;
                    target.array.splice(target.index, 1);
                    if (dragBrowserSourceInfo.newBrowser) {
                        mergeCampaignsConfigService.config.browsers.pop();
                    }
                    dragBrowserSourceInfo = null;
                }
            };

            mergeCampaignsConfigService.dropTargetBrowserSource = function (event) {
                var dragInfo = dragBrowserSourceInfo;
                if (dragInfo) {
                    var source = dragInfo.source;
                    var target = dragInfo.target;
                    restoreConfig();
                    source.array.splice(source.index, 1);
                    if (source.array == target.array && target.index > source.index) {
                        target.index--;
                    }
                    target.array.splice(target.index, 0, source.item)
                    if (dragInfo.newBrowser) {
                        mergeCampaignsConfigService.config.browsers.push({
                            name : source.item.name,
                            sources : [source.item]
                        })
                    }
                    updateConfig();
                }
            };

            mergeCampaignsConfigService.dropTargetBrowserSourceEnter = function (event, array, index) {
                var dragSource = event.dragSource;
                dragSource = dragSource.internalDrag && dragSource.getData(mergeCampaignsConfigService);
                if (dragSource) {
                    if (dragBrowserSourceInfo) {
                        if (index >= array.length && dragBrowserSourceInfo.target.array == array) {
                            index = array.length - 1;
                        }
                        if (dragBrowserSourceInfo.target.array == array && dragBrowserSourceInfo.target.index == index) {
                            return registerDragEnter();
                        }
                    }
                    restoreConfig();
                    dragBrowserSourceInfo = {
                        source : dragSource,
                        target : {
                            array : array,
                            index : index
                        }
                    };
                    array.splice(index, 0, dragSource.itemCopy);
                    return registerDragEnter();
                }
                return null;
            };

            mergeCampaignsConfigService.dropTargetNewBrowserEnter = function (event) {
                var dragSource = event.dragSource;
                dragSource = dragSource.internalDrag && dragSource.getData(mergeCampaignsConfigService);
                if (dragSource) {
                    if (dragBrowserSourceInfo && dragBrowserSourceInfo.newBrowser) {
                        return registerDragEnter();
                    }
                    restoreConfig();
                    var array = [dragSource.itemCopy];
                    dragBrowserSourceInfo = {
                        source : dragSource,
                        target : {
                            array : array,
                            index : 0
                        },
                        newBrowser : true
                    };
                    mergeCampaignsConfigService.config.browsers.push({
                        name : dragSource.itemCopy.name,
                        sources : array
                    })
                    return registerDragEnter();
                }
                return null;
            };

            mergeCampaignsConfigService.dropTargetBrowserSourceLeave = function (event) {
                removeDragEnter(event.dragEnter);
            };

            mergeCampaignsConfigService.getBrowserSourceStyle = function (browserSource) {
                var res = {
                    'background-color' : campaignsManager.getCampaignColor(browserSource.campaign)
                };
                if (dragBrowserSourceInfo) {
                    if (browserSource == dragBrowserSourceInfo.source.item) {
                        res.display = "none";
                    }
                    if (browserSource == dragBrowserSourceInfo.source.itemCopy) {
                        res.opacity = "0.5";
                    }
                }
                return res;
            };

            mergeCampaignsConfigService.getDragSourceForBrowserSource = function (array, index) {
                var item = array[index];
                return [{
                            type : mergeCampaignsConfigService,
                            value : {
                                array : array,
                                index : index,
                                item : item,
                                itemCopy : {
                                    name : item.name,
                                    campaign : item.campaign
                                }
                            }
                        }]
            };

            var getBrowser = function (name) {
                var browsers = mergeCampaignsConfigService.config.browsers;
                for (var i = 0, l = browsers.length; i < l; i++) {
                    var curBrowser = browsers[i];
                    if (curBrowser.name == name) {
                        return curBrowser;
                    }
                }
                var res = {
                    name : name,
                    sources : []
                };
                browsers.push(res);
                return res;
            };

            mergeCampaignsConfigService.addBrowserSources = function (browserSources) {
                var usedBrowsers = mergeCampaignsConfigService.usedBrowsers;
                browserSources.forEach(function (browser) {
                    var index = usedBrowsers.indexOf(browser);
                    if (index == -1) {
                        getBrowser(browser.name).sources.push(browser);
                    }
                });
                updateConfig();
            };

            mergeCampaignsConfigService.addCampaign = function (campaign) {
                var selectedCampaigns = mergeCampaignsConfigService.selectedCampaigns;
                if (selectedCampaigns.indexOf(campaign) > -1) {
                    return;
                }
                mergeCampaignsConfigService.addBrowserSources(campaign.browsersArray);
            };

            var updateConfig = function () {
                var selectedCampaigns = [];
                var unusedBrowsers = [];
                var usedBrowsers = [];
                var checkCampaign = function (campaign) {
                    if (selectedCampaigns.indexOf(campaign) == -1) {
                        selectedCampaigns.push(campaign);
                        unusedBrowsers.push.apply(unusedBrowsers, campaign.browsersArray);
                    }
                };
                var processBrowserSource = function (browserSource) {
                    checkCampaign(browserSource.campaign);
                    var index = unusedBrowsers.indexOf(browserSource);
                    if (index > -1) {
                        unusedBrowsers.splice(index, 1);
                        usedBrowsers.push(browserSource);
                    }
                };
                mergeCampaignsConfigService.config.browsers = mergeCampaignsConfigService.config.browsers.filter(function (
                        browser) {
                    browser.sources.forEach(processBrowserSource);
                    return browser.sources.length > 0;
                });
                mergeCampaignsConfigService.selectedCampaigns = selectedCampaigns;
                mergeCampaignsConfigService.unusedBrowsers = unusedBrowsers;
                mergeCampaignsConfigService.usedBrowsers = usedBrowsers;
            };

            mergeCampaignsConfigService.removeCampaign = function (campaign) {
                var campaignFilter = function (browserSource) {
                    return browserSource.campaign != campaign;
                };
                mergeCampaignsConfigService.config.browsers.forEach(function (browser) {
                    browser.sources = browser.sources.filter(campaignFilter)
                });
                updateConfig();
            };

            mergeCampaignsConfigService.removeBrowser = function (browserIndex) {
                mergeCampaignsConfigService.config.browsers.splice(browserIndex, 1);
                updateConfig();
            };

            mergeCampaignsConfigService.removeBrowserSource = function (browser, browserSourceIndex) {
                browser.sources.splice(browserSourceIndex, 1);
                updateConfig();
            };

            mergeCampaignsConfigService.submit = function () {
                try {
                    var campaign = attesterMergeCampaigns(mergeCampaignsConfigService.config);
                    campaignsManager.createSourceFromCampaignObject(campaign).active = true;
                    mergeCampaignsConfigService.error = "";
                } catch (e) {
                    mergeCampaignsConfigService.error = e + "";
                }
            };

            mergeCampaignsConfigService.clear = function () {
                mergeCampaignsConfigService.config = {
                    browsers : [],
                    keepExecutions : "lastGroup"
                };
                mergeCampaignsConfigService.unusedBrowsers = [];
                mergeCampaignsConfigService.usedBrowsers = [];
                mergeCampaignsConfigService.selectedCampaigns = [];
                mergeCampaignsConfigService.waitingSources = [];
                mergeCampaignsConfigService.error = "";
            };

            mergeCampaignsConfigService.isExpanded = function () {
                return mergeCampaignsConfigService.selectedCampaigns.length > 0
                        || mergeCampaignsConfigService.waitingSources.length > 0
            };

            mergeCampaignsConfigService.clear();

            return mergeCampaignsConfigService;

        }]).directive("mergeCampaignsConfig", ["mergeCampaignsConfigService", "attesterCampaignsManager",
        function (mergeCampaignsConfigService, campaignsManager) {

            return {
                restrict : "E",
                scope : {},
                templateUrl : "mergeCampaignsConfig/mergeCampaignsConfig.html",
                controller : ["$scope", function ($scope) {
                            $scope.ctrl = mergeCampaignsConfigService;
                            $scope.campaignsManager = campaignsManager;
                        }]
            };
        }]);
