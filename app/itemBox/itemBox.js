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

angular.module("attesterItemBox", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("itemBox/itemBox.html", require("./itemBox.html"));
}]).directive("itemBox", function () {
    return {
        restrict : "E",
        transclude : true,
        scope : {
            close : "&",
            label : "=",
            editable : "="
        },
        templateUrl : "itemBox/itemBox.html",
        link : function (scope, element, attrs) {
            scope.scope = scope;
            scope.closable = "close" in attrs;
            element.on("dblclick", function (event) {
                if (scope.editable && !scope.editing) {
                    scope.$apply(function () {
                        scope.editing = true;
                    });
                    setTimeout(function () {
                        var item = element.find("input")[0];
                        if (item) {
                            item.select();
                        }
                    }, 10);
                }

            });
            scope.inputBlur = function () {
                scope.editing = false;
            };
        }
    };
});