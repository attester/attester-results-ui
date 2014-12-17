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

describe('mergeCampaigns', function () {
    beforeEach(module('attesterMergeCampaigns'));

    it('order 1, keep last group', inject(function (AttesterCampaign, attesterMergeCampaigns) {
        var campaignNoFailure = new AttesterCampaign();
        var campaignWithFailure = new AttesterCampaign();
        campaignNoFailure.setContentFromString(MySimpleClassTest.reportNoFailure);
        campaignWithFailure.setContentFromString(MySimpleClassTest.reportWithFailure);

        var mergedCampaign = attesterMergeCampaigns({
            browsers : [{
                        name : "default",
                        sources : [campaignWithFailure.browsersArray[0], campaignNoFailure.browsersArray[0]]
                    }],
            keepExecutions : "lastGroup"
        });
        MySimpleClassTest.commonCampaignChecks(mergedCampaign);
        MySimpleClassTest.checkOneExecution(mergedCampaign);
        var browserKey = mergedCampaign.browsersArray[0].browserKey;
        expect(mergedCampaign.tasksGroups[0].browsers[browserKey].lastExecution.errors).to.not.exist;
        expect(mergedCampaign.tasksGroups[1].browsers[browserKey].lastExecution.errors).to.not.exist;
    }));

    it('order 2, keep last group', inject(function (AttesterCampaign, attesterMergeCampaigns) {
        var campaignNoFailure = new AttesterCampaign();
        var campaignWithFailure = new AttesterCampaign();
        campaignNoFailure.setContentFromString(MySimpleClassTest.reportNoFailure);
        campaignWithFailure.setContentFromString(MySimpleClassTest.reportWithFailure);

        var mergedCampaign = attesterMergeCampaigns({
            browsers : [{
                        name : "default",
                        sources : [campaignNoFailure.browsersArray[0], campaignWithFailure.browsersArray[0]]
                    }],
            keepExecutions : "lastGroup"
        });
        MySimpleClassTest.commonCampaignChecks(mergedCampaign);
        MySimpleClassTest.checkOneExecution(mergedCampaign);
        var browserKey = mergedCampaign.browsersArray[0].browserKey;
        expect(mergedCampaign.tasksGroups[0].browsers[browserKey].lastExecution.errors).to.not.exist;
        expect(mergedCampaign.tasksGroups[1].browsers[browserKey].lastExecution.errors[0].error.message).to.equal("Assert #1 failed : add returned something wrong");
    }));

    it('order 1, keep all', inject(function (AttesterCampaign, attesterMergeCampaigns) {
        var campaignNoFailure = new AttesterCampaign();
        var campaignWithFailure = new AttesterCampaign();
        campaignNoFailure.setContentFromString(MySimpleClassTest.reportNoFailure);
        campaignWithFailure.setContentFromString(MySimpleClassTest.reportWithFailure);

        var mergedCampaign = attesterMergeCampaigns({
            browsers : [{
                        name : "default",
                        sources : [campaignWithFailure.browsersArray[0], campaignNoFailure.browsersArray[0]]
                    }],
            keepExecutions : "all"
        });
        MySimpleClassTest.commonCampaignChecks(mergedCampaign);
        var browserKey = mergedCampaign.browsersArray[0].browserKey;
        expect(mergedCampaign.tasksGroups[0].browsers[browserKey].executions.length).to.equal(2);
        expect(mergedCampaign.tasksGroups[0].browsers[browserKey].executions[0].errors).to.not.exist;
        expect(mergedCampaign.tasksGroups[0].browsers[browserKey].executions[1].errors).to.not.exist;
        expect(mergedCampaign.tasksGroups[1].browsers[browserKey].executions.length).to.equal(2);
        expect(mergedCampaign.tasksGroups[1].browsers[browserKey].executions[0].errors[0].error.message).to.equal("Assert #1 failed : add returned something wrong");
        expect(mergedCampaign.tasksGroups[1].browsers[browserKey].executions[1].errors).to.not.exist;
    }));
});
