/*
 * Copyright 2019 Amadeus s.a.s.
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

angular.module("attesterDurationFilter", []).filter('duration', function () {
    return function (input) {
        var d = 0, h = 0, m = 0, s = 0, ms = +input;
        if (!(ms >= 0)) {
            return "";
        }
        if (ms >= 1000) {
            s = Math.floor(ms / 1000);
            ms = ms % 1000;
            if (s >= 60) {
                m = Math.floor(s / 60);
                s = s % 60;
                if (m >= 60) {
                    h = Math.floor(m / 60);
                    m = m % 60;
                    if (h >= 24) {
                        d = Math.floor(h / 24);
                        h = h % 24;
                    }
                }
            }
        }
        var res = "";
        if (d > 0) {
            res += " " + d + "d";
        }
        if (h > 0) {
            res += " " + h + "h";
        }
        if (m > 0) {
            res += " " + m + "m";
        }
        if (s > 0) {
            res += " " + s + "s";
        }
        if (!res || ms > 0) {
            res += " " + ms + "ms";
        }
        return res;
    };
});
