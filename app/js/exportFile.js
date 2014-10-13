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

angular.module("exportFile", []).factory("exportFile", function () {
    return function (content, options, fileName) {
        var blob = new Blob(content, options);
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute("download", fileName);
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            a.parentNode.removeChild(a);
        }, 1);
    };
});