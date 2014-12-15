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

    var module = angular.module("dragdrop", []);

    var dragSource = null;
    var dragEntersArray = [];

    var isAncestor = function (ancestor, child) {
        while (child) {
            if (child === ancestor) {
                return true;
            }
            child = child.parentNode;
        }
        return false;
    };

    var addDragEnter = function (dragEnter, event) {
        var target = event.target;
        for (var i = dragEntersArray.length - 1; i >= 0; i--) {
            var curItem = dragEntersArray[i];
            if (!isAncestor(curItem.target, target)) {
                curItem.leave(event);
            }
        }
        dragEntersArray.push(dragEnter);
    };

    var removeDragEnter = function (dragEnter) {
        var index = dragEntersArray.indexOf(dragEnter);
        if (index > -1) {
            dragEntersArray.splice(index, 1);
        }
    };

    var getData = function (type) {
        for (var i = 0, l = this.length; i < l; i++) {
            var item = this[i];
            if (item.type === type) {
                return item.value;
            }
        }
    };

    module.directive("dragSource", ["$parse", function ($parse) {
                return {
                    restrict : 'A',
                    compile : function ($element, attr) {
                        var callDragSource = $parse(attr.dragSource);
                        return function (scope, element) {
                            element.attr("draggable", "true");
                            element.on("dragstart", function (event) {
                                scope.$apply(function () {
                                    dragSource = callDragSource(scope);
                                    if (dragSource) {
                                        var dataTransfer = event.dataTransfer;
                                        // Make sure there is some data to transfer for the drag
                                        // not to be cancelled by the browser:
                                        dataTransfer.setData("application/x-something", "true");
                                        dragSource.forEach(function (curItem) {
                                            var type = curItem.type;
                                            if (typeof type == "string") {
                                                dataTransfer.setData(type, curItem.value);
                                            }
                                        });
                                        dragSource.getData = getData;
                                        dragSource.internalDrag = true;
                                    } else {
                                        event.preventDefault(); // not dragging anything
                                    }
                                });
                            });
                            element.on("dragend", function (event) {
                                if (dragSource) {
                                    scope.$apply(function () {
                                        dragSource = null;
                                    });
                                }
                            });
                        };
                    }
                };

            }]);

    module.directive("dragTarget", ["$parse", function ($parse) {
                return {
                    restrict : 'A',
                    compile : function ($element, attr) {
                        var dragTarget = $parse(attr.dragTarget);
                        var dragTargetEnter = $parse(attr.dragTargetEnter);
                        var dragTargetLeave = $parse(attr.dragTargetLeave);
                        return function (scope, element) {
                            var currentDrag = null;
                            var currentDragLeave = function (event, drop) {
                                var curDrag = currentDrag;
                                if (curDrag) {
                                    currentDrag = null;
                                    removeDragEnter(curDrag);
                                    var dataTransfer = event.dataTransfer;
                                    var params = {
                                        $event : {
                                            drop : !!drop,
                                            dataTransfer : dataTransfer,
                                            dragSource : dragSource || dataTransfer,
                                            dragEnter : curDrag.dragEnter,
                                            event : event
                                        }
                                    };
                                    if (drop) {
                                        dragTarget(scope, params);
                                    }
                                    dragTargetLeave(scope, params);
                                }
                            };
                            element.on("dragover", function (event) {
                                event.preventDefault();
                            });
                            element.on("dragenter", function (event) {
                                if (currentDrag) {
                                    currentDrag.count++;
                                } else {
                                    scope.$apply(function () {
                                        currentDrag = {
                                            target : element[0],
                                            count : 1,
                                            leave : currentDragLeave
                                        };
                                        addDragEnter(currentDrag, event);
                                        var dataTransfer = event.dataTransfer;
                                        currentDrag.dragEnter = dragTargetEnter(scope, {
                                            $event : {
                                                dataTransfer : dataTransfer,
                                                dragSource : dragSource || dataTransfer,
                                                event : event
                                            }
                                        });
                                    });
                                }
                            });
                            element.on("dragleave", function (event) {
                                if (currentDrag) {
                                    currentDrag.count--;
                                    if (currentDrag.count == 0) {
                                        scope.$apply(function () {
                                            currentDrag.leave(event);
                                        });
                                    }
                                }
                            });
                            element.on("drop", function (event) {
                                if (currentDrag) {
                                    event.preventDefault();
                                    scope.$apply(function () {
                                        currentDrag.leave(event, true);
                                    });
                                }
                            });
                        }
                    }
                };
            }]);
})();