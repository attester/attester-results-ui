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
    angular.module("uib/template/tabs/tab.html",[]).run(["$templateCache", function(a){
        // angular-ui added, in v0.12.0, an href attribute on the <a> tag below, which broke
        // the drag & drop feature on some browsers: on Firefox, dragging an itemBox element
        // contained inside a <uib-tab-heading> tag drags the whole <a> tag
        // the following line overrides the default template to remove the href attribute from the <a> link
        a.put("uib/template/tabs/tab.html",'<li ng-class="{active: active, disabled: disabled}" class="uib-tab"><a ng-click="select()" uib-tab-heading-transclude>{{heading}}</a></li>');
    }]);

    var app = angular.module("attester-ui", ["attesterTasksTable", "attesterCampaignChooser", "attesterItemBox",
            "attesterMergeCampaignsConfig", "attesterMergeCampaignsConfigDisplay", "attesterCampaignsManager",
            "attesterCompareCampaignsSelector", "attesterExecutionStates", "ui.bootstrap", "dragdrop", "exportFile"]);

    app.controller("MainViewController", ["$http", "$scope", "attesterCampaignsManager", "exportFile", "AttesterExecutionStates",
            function ($http, $scope, campaignsManager, exportFile, executionStates) {
                document.body.style.display = "";
                var ctrl = this;

                $scope.campaignsManager = campaignsManager;

                var comparators = ctrl.comparators = [];
                ctrl.addComparator = function (comparator) {
                    if (comparator.campaign) {
                        ctrl.addSource(comparator);
                        return;
                    }
                    comparators.push(comparator);
                    comparator.active = true;
                };

                ctrl.removeComparator = function (index) {
                    comparators.splice(index, 1);
                };

                ctrl.saveLogs = function (campaign) {
                    exportFile.saveURL(campaign.getBlobURL(), campaign.campaignId + ".json");
                };

                ctrl.executionChooser = function (value) {
                    if (!value) {
                        return executionStates.getExecutionChooser();
                    }
                    executionStates.setExecutionChooser(value);
                };

                $http.get("config.json").success(function (config) {
                    for (var key in config) {
                        var item = config[key];
                        if (/URL$/.test(key) && config.hasOwnProperty(key) && (typeof item) == "string") {
                            config[key] = item.replace(/^\{CURRENTHOST\}/, location.protocol + '//' + location.host);
                        }
                        if (/URLs$/.test(key) && config.hasOwnProperty(key) && item && item.length > 0) {
                            config[key] = item.map(function (url) {
                                return url.replace(/^\{CURRENTHOST\}/, location.protocol + '//' + location.host)
                            });
                        }
                    }
                    ctrl.config = config;

                    (config.loadServerURLs || []).forEach(function (url) {
                        autoLoadedTabs.push(campaignsManager.createSourceFromServerURL(url));
                    });
                    (config.loadReportURLs || []).forEach(function (url) {
                        autoLoadedTabs.push(campaignsManager.createSourceFromReportURL(url));
                    });

                    if (autoLoadedTabs.length > 0) {
                        autoLoadedTabs[0].active = true;
                    }
                });
            }]);
})();
