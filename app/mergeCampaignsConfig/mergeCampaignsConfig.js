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

angular.module("attesterMergeCampaignsConfig", ["attesterMergeCampaigns", "attesterItemBox", "attesterCampaignsManager"]).directive("mergeCampaignsConfig", [
        "$timeout", "attesterMergeCampaigns", "attesterCampaignsManager",
        function ($timeout, attesterMergeCampaigns, campaignsManager) {

            return {
                restrict : "E",
                scope : {},
                templateUrl : "mergeCampaignsConfig/mergeCampaignsConfig.html",
                controllerAs : "ctrl",
                controller : ["$scope", function ($scope) {
                    $scope.scope = $scope;
                    $scope.campaignsManager = campaignsManager;

                    this.mainDrop = function (dragSource) {
                        var sources = campaignsManager.createSourcesFromDragSource(dragSource);
                        if (sources) {
                            var waitingSources = $scope.waitingSources;
                            waitingSources.push.apply(waitingSources, sources);
                            this.refreshWaitingSources();
                        }
                    };

                    this.removeWaitingSource = function (index) {
                        $scope.waitingSources.splice(index, 1);
                    };

                    this.refreshWaitingSources = function () {
                        var curWaitingSources = $scope.waitingSources;
                        var newWaitingSources = curWaitingSources.filter(function (waitingSource) {
                            var campaign = waitingSource.campaign;
                            if (campaign) {
                                this.addCampaign(campaign);
                            }
                            return !campaign;
                        }, this);
                        if (newWaitingSources.length != curWaitingSources.length) {
                            $scope.waitingSources = newWaitingSources;
                        }
                    };

                    this.getWaitingSources = function () {
                        this.refreshWaitingSources();
                        return $scope.waitingSources;
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
                                $scope.config.browsers.pop();
                            }
                            dragBrowserSourceInfo = null;
                        }
                    };

                    this.dropTargetBrowserSource = function (event) {
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
                                $scope.config.browsers.push({
                                    name : source.item.name,
                                    sources : [source.item]
                                })
                            }
                            updateConfig();
                        }
                    };

                    this.dropTargetBrowserSourceEnter = function (event, array, index) {
                        var dragSource = event.dragSource;
                        dragSource = dragSource.internalDrag && dragSource.getData(this);
                        if (dragSource) {
                            if (dragBrowserSourceInfo) {
                                if (index >= array.length && dragBrowserSourceInfo.target.array == array) {
                                    index = array.length - 1;
                                }
                                if (dragBrowserSourceInfo.target.array == array
                                        && dragBrowserSourceInfo.target.index == index) {
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

                    this.dropTargetNewBrowserEnter = function (event) {
                        var dragSource = event.dragSource;
                        dragSource = dragSource.internalDrag && dragSource.getData(this);
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
                            $scope.config.browsers.push({
                                name : dragSource.itemCopy.name,
                                sources : array
                            })
                            return registerDragEnter();
                        }
                        return null;
                    };

                    this.dropTargetBrowserSourceLeave = function (event) {
                        removeDragEnter(event.dragEnter);
                    };

                    this.getBrowserSourceStyle = function (browserSource) {
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

                    this.getDragSourceForBrowserSource = function (array, index) {
                        var item = array[index];
                        return [{
                                    type : this,
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
                        var browsers = $scope.config.browsers;
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

                    this.addCampaign = function (campaign) {
                        var selectedCampaigns = $scope.selectedCampaigns;
                        if (selectedCampaigns.indexOf(campaign) > -1) {
                            return;
                        }
                        $scope.selectedCampaigns.push(campaign);
                        campaign.browsersArray.forEach(function (browser) {
                            getBrowser(browser.name).sources.push(browser);
                        });
                    };

                    var updateConfig = function () {
                        var selectedCampaigns = [];
                        var unusedBrowsers = [];
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
                            }
                        };
                        $scope.config.browsers = $scope.config.browsers.filter(function (browser) {
                            browser.sources.forEach(processBrowserSource);
                            return browser.sources.length > 0;
                        });
                        $scope.selectedCampaigns = selectedCampaigns;
                        $scope.unusedBrowsers = unusedBrowsers;
                    };

                    this.removeCampaign = function (campaign) {
                        var campaignFilter = function (browserSource) {
                            return browserSource.campaign != campaign;
                        };
                        $scope.config.browsers.forEach(function (browser) {
                            browser.sources = browser.sources.filter(campaignFilter)
                        });
                        updateConfig();
                    };

                    this.removeBrowser = function (browserIndex) {
                        $scope.config.browsers.splice(browserIndex, 1);
                        updateConfig();
                    };

                    this.removeBrowserSource = function (browser, browserSourceIndex) {
                        browser.sources.splice(browserSourceIndex, 1);
                        updateConfig();
                    };

                    this.submit = function () {
                        try {
                            var campaign = attesterMergeCampaigns($scope.config);
                            campaignsManager.createSourceFromCampaignObject(campaign).active = true;
                            $scope.error = "";
                        } catch (e) {
                            $scope.error = e + "";
                        }
                    };

                    this.clear = function () {
                        $scope.config = {
                            browsers : [],
                            keepExecutions : "lastGroup"
                        };
                        $scope.unusedBrowsers = [];
                        $scope.selectedCampaigns = [];
                        $scope.waitingSources = [];
                        $scope.error = "";
                    };

                    this.isExpanded = function () {
                        return $scope.selectedCampaigns.length > 0 || $scope.waitingSources.length > 0
                    };

                    this.clear();
                }]
            };
        }]);
