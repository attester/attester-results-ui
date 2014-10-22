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

var optimist = require("optimist").usage("$0").options({
    "help" : {
        description : "Displays this help message and exits."
    },
    "port" : {
        description : "Port number",
        "default" : process.env.npm_package_config_port || 8080 // Default to 8080 if we're not using npm
    },
    "server-url" : {
        description : "Default server URL",
        "default" : "http://localhost:7777"
    },
    "report-url" : {
        description : "Default report URL"
    },
    "test-url" : {
        description : "String to prepend to the name of the test to build the test URLs."
    }
});

var argv = optimist.argv;
var attesterAngularUI = require("./index");

var main = function () {
    var app = attesterAngularUI({
        testURL : argv["test-url"],
        serverURL : argv["server-url"],
        reportURL : argv["report-url"]
    });

    var port = argv.port;
    var server;

    var startServer = function (port) {
        server = app.listen(port);
        server.on("listening", serverStarted);
    };

    var serverStarted = function () {
        console.log("Server started on http://localhost:" + server.address().port);
    };

    startServer(argv.port);
    server.on("error", function () {
        // Retry on a random port
        console.error("Configured port is not available, using a random address");
        server = app.listen(0);
        server.on("listening", serverStarted);
    });
}

if (argv.help) {
    optimist.showHelp();
} else {
    main();
}
