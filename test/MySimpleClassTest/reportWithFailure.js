window.MySimpleClassTest = window.MySimpleClassTest || {};
MySimpleClassTest.reportWithFailure = JSON.stringify([{
            "event" : "tasksList",
            "campaignId" : "20141217100434",
            "tasks" : [{
                        "name" : "MainTestSuite",
                        "subTasks" : [{
                                    "taskId" : 0,
                                    "name" : "test.sample.MySimpleClassTest"
                                }, {
                                    "taskId" : 1,
                                    "name" : "test.sample.MySimpleClassTest2"
                                }]
                    }],
            "time" : 1418807074527
        }, {
            "event" : "serverAttached",
            "homeURL" : "http://127.0.0.1:7777/",
            "slaveURL" : "http://127.0.0.1:7777/__attester__/slave.html",
            "time" : 1418807074529
        }, {
            "event" : "taskStarted",
            "taskId" : 0,
            "taskName" : "test.sample.MySimpleClassTest",
            "slave" : {
                "userAgent" : "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.0 Safari/534.34",
                "address" : "127.0.0.1",
                "addressName" : null,
                "port" : 49846
            },
            "time" : 1418807075284
        }, {
            "event" : "taskStarted",
            "taskId" : 1,
            "taskName" : "test.sample.MySimpleClassTest2",
            "slave" : {
                "userAgent" : "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.0 Safari/534.34",
                "address" : "127.0.0.1",
                "addressName" : null,
                "port" : 49845
            },
            "time" : 1418807075335
        }, {
            "name" : "test.sample.MySimpleClassTest",
            "testId" : 1,
            "time" : 1418807076423,
            "event" : "testStarted",
            "taskId" : 0
        }, {
            "name" : "test.sample.MySimpleClassTest",
            "method" : "testAdd()",
            "testId" : 2,
            "parentTestId" : 1,
            "time" : 1418807076443,
            "event" : "testStarted",
            "taskId" : 0
        }, {
            "testId" : 2,
            "name" : "test.sample.MySimpleClassTest",
            "method" : "testAdd()",
            "time" : 1418807076449,
            "event" : "testFinished",
            "duration" : 6,
            "taskId" : 0
        }, {
            "testId" : 1,
            "name" : "test.sample.MySimpleClassTest",
            "asserts" : 1,
            "time" : 1418807076450,
            "event" : "testFinished",
            "duration" : 27,
            "taskId" : 0
        }, {
            "time" : 1418807076467,
            "event" : "coverage",
            "taskId" : 0
        }, {
            "event" : "taskFinished",
            "taskId" : 0,
            "time" : 1418807076474
        }, {
            "name" : "test.sample.MySimpleClassTest2",
            "testId" : 1,
            "time" : 1418807076466,
            "event" : "testStarted",
            "taskId" : 1
        }, {
            "name" : "test.sample.MySimpleClassTest2",
            "method" : "testAdd()",
            "testId" : 2,
            "parentTestId" : 1,
            "time" : 1418807076483,
            "event" : "testStarted",
            "taskId" : 1
        }, {
            "testId" : 2,
            "name" : "test.sample.MySimpleClassTest2",
            "method" : "testAdd()",
            "error" : {
                "failure" : true,
                "message" : "Assert #1 failed : add returned something wrong",
                "stack" : [{
                            "function" : "onTestFailure ",
                            "file" : "http://127.0.0.1:7777/campaign20141217100434/__attester__/aria-templates/run.js",
                            "line" : "136"
                        }]
            },
            "time" : 1418807076485,
            "event" : "error",
            "taskId" : 1
        }, {
            "testId" : 2,
            "name" : "test.sample.MySimpleClassTest2",
            "method" : "testAdd()",
            "time" : 1418807076489,
            "event" : "testFinished",
            "duration" : 6,
            "taskId" : 1
        }, {
            "testId" : 1,
            "name" : "test.sample.MySimpleClassTest2",
            "asserts" : 1,
            "time" : 1418807076490,
            "event" : "testFinished",
            "duration" : 24,
            "taskId" : 1
        }, {
            "time" : 1418807076502,
            "event" : "coverage",
            "taskId" : 1
        }, {
            "event" : "taskFinished",
            "taskId" : 1,
            "time" : 1418807076505
        }, {
            "event" : "campaignFinished",
            "time" : 1418807076506
        }]);