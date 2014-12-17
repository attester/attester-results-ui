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

'use strict';

window.MySimpleClassTest = window.MySimpleClassTest || {};

MySimpleClassTest.commonCampaignChecks = function (campaign) {
    expect(campaign.browsersArray.length).to.equal(1);
    expect(campaign.browsersArray[0].name).to.equal("default");
    expect(campaign.tasksGroups.length).to.equal(2);
    expect(campaign.tasksGroups[0].name).to.equal("test.sample.MySimpleClassTest");
    expect(campaign.tasksGroups[1].name).to.equal("test.sample.MySimpleClassTest2");
};

MySimpleClassTest.checkOneExecution = function (campaign) {
    var browserKey = campaign.browsersArray[0].browserKey;
    campaign.tasksGroups.forEach(function (tasksGroup) {
        expect(tasksGroup.browsers[browserKey].executions.length).to.equal(1);
    });
};
