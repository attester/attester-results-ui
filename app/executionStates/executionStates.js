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

angular.module("attesterExecutionStates", []).factory("AttesterExecutionStates", function () {
    var iconClasses = {
        "success" : "glyphicon glyphicon-ok-sign task-success",
        "error" : "glyphicon glyphicon-remove-sign task-error",
        "ignored" : "glyphicon glyphicon-ban-circle task-ignored",
        "waiting" : "glyphicon glyphicon-question-sign task-waiting"
    };

    var getExecutionState = function (execution) {
        if (execution.errors) {
            return "error";
        } else if (execution.finished) {
            return "success";
        } else if (execution.ignored) {
            return "ignored";
        } else {
            return "waiting";
        }
    };

    var getStateIcon = function (state) {
        return iconClasses[state];
    };

    var getExecutionIcon = function (execution) {
        var res = getStateIcon(getExecutionState(execution));
        if (execution.started && !execution.finished) {
            res += " task-running";
        }
        return res;
    };

    var getExecution = function (browserTask) {
        if (!browserTask) {
            return {
                ignored : true
            };
        }
        var lastExecution = browserTask.lastExecution;
        var executionsLength = browserTask.executions.length;
        if (executionsLength > 1 && getExecutionState(lastExecution) == "waiting") {
            lastExecution = browserTask.executions[executionsLength - 2];
        }
        return lastExecution;
    };

    return {
        getStateIcon : getStateIcon,
        getExecution : getExecution,
        getExecutionState : getExecutionState,
        getExecutionIcon : getExecutionIcon,
        getTaskState : function (browserTask) {
            return getExecutionState(getExecution(browserTask));
        },
        getTaskIcon : function (browserTask) {
            var res = getExecutionIcon(getExecution(browserTask));
            if (browserTask && browserTask.executions.length > 1) {
                var lastExecution = browserTask.lastExecution;
                var lastExecutionState = getExecutionState(lastExecution);
                if (lastExecutionState == "waiting") {
                    res += " task-not-definitive";
                }
                if (lastExecution.started && !lastExecution.finished) {
                    res += " task-running";
                }
                res += " task-multi-executions";
            }
            return res;
        }
    };
});
