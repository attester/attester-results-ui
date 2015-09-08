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

angular.module("attesterLiveCampaign", ["attesterCampaign"]).factory("AttesterLiveCampaign", ["AttesterCampaign",
        "$rootScope", function (AttesterCampaign, $rootScope) {
            var notifyDataModelChange = function () {
                $rootScope.$digest();
            };

            var AttesterLiveCampaign = function (serverAddress) {
                var liveCampaign = this;
                liveCampaign.connected = false;
                liveCampaign.campaign = null;
                liveCampaign.resultsReceived = null;
                liveCampaign.resultsTotal = null;

                var addressMatch = /^(https?:\/\/[^\/]*)(?:\/campaign([0-9]+))?$/.exec(serverAddress);
                var socketAddress = addressMatch ? addressMatch[1] : serverAddress;
                var campaignId = addressMatch ? addressMatch[2] || null : null;
                var socket;

                var onConnect = function () {
                    if (!socket) {
                        return;
                    }
                    liveCampaign.connected = true;
                    socket.emit('hello', {
                        type : 'viewer',
                        campaignId : campaignId
                    });
                    notifyDataModelChange();
                };
                var onFirstResults = function (event) {
                    if (!socket) {
                        return;
                    }
                    liveCampaign.resultsReceived = event.transmitted;
                    liveCampaign.resultsTotal = event.total;
                    socket.emit("firstResults");
                    notifyDataModelChange();
                };
                var onResult = function (event) {
                    if (!socket) {
                        return;
                    }
                    var campaign = liveCampaign.campaign;
                    if (!campaign) {
                        campaign = liveCampaign.campaign = new AttesterCampaign();
                        liveCampaign.resultsReceived = 0;
                        liveCampaign.resultsTotal = 1;
                    }
                    campaign.addEvent(event);
                    notifyDataModelChange();
                };
                var onConnectError = function () {
                    if (socket && !liveCampaign.campaign) {
                        setTimeout(connect, 2000);
                    }
                };
                var onDisconnect = function () {
                    liveCampaign.connected = false;
                    notifyDataModelChange();
                    onConnectError();
                };

                var resetManagers = function () {
                    var managers = io.managers;
                    for (var address in managers) {
                        delete managers[address];
                    }
                };

                var connect = function () {
                    if (!socket) {
                        return;
                    }
                    resetManagers();
                    socket = io(socketAddress, {
                        reconnection : false
                    });
                    socket.on("connect", onConnect);
                    socket.on("firstResults", onFirstResults);
                    socket.on("result", onResult);
                    socket.on("disconnect", onDisconnect);
                    socket.on("connect_error", onConnectError);
                }

                this.type = "serverURL";
                this.serverURL = serverAddress;
                this.socketURL = socketAddress;
                this.campaignId = campaignId;
                this.disconnect = function () {
                    var mySocket = socket;
                    if (mySocket) {
                        socket = null;
                        setTimeout(function () {
                            mySocket.disconnect();
                        });
                    }
                };

                socket = true;
                connect();
            };
            return AttesterLiveCampaign;
        }]);
