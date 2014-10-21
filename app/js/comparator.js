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

angular.module("attesterCampaignsComparator", []).factory("AttesterCampaignsComparator", function () {
    var copy = function (src, dst) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                dst[key] = src[key];
            }
        }
    };

    var AttesterComparator = function (browsers) {
        this.browsersArray = browsers;
        var campaigns = this.campaigns = [];
        var browsersMap = this.browsersMap = {};
        var tasksGroups = this.tasksGroups = [];
        var tasksGroupsMap = {};
        browsers.forEach(function (curBrowser) {
            browsersMap[curBrowser.browserKey] = curBrowser;
            var curCampaign = curBrowser.campaign;
            if (campaigns.indexOf(curCampaign) == -1) {
                campaigns.push(curCampaign);
            }
        });
        var getTask = function (name) {
            var res = tasksGroupsMap[name];
            if (!res) {
                res = tasksGroupsMap[name] = {
                    name : name,
                    campaigns : {},
                    browsers : {}
                };
                tasksGroups.push(res);
            }
            return res;
        };
        campaigns.forEach(function (curCampaign) {
            var campaignKey = curCampaign.campaignKey;
            curCampaign.tasksGroups.forEach(function (campaignTaskGroup) {
                var globalTaskGroup = getTask(campaignTaskGroup.name);
                if (globalTaskGroup.campaigns[campaignKey]) {
                    console.log("Several tasks have the same name in campaign " + curCampaign.campaignId + ": "
                            + campaignTaskGroup.name);
                    return;
                }
                globalTaskGroup.campaigns[campaignKey] = campaignTaskGroup;
                copy(campaignTaskGroup.browsers, globalTaskGroup.browsers);
            });
        });
    };

    return AttesterComparator;
});