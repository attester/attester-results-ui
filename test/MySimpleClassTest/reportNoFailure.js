window.MySimpleClassTest = window.MySimpleClassTest || {};
MySimpleClassTest.reportNoFailure = JSON.stringify([{
            "event" : "tasksList",
            "campaignId" : "20141217101004",
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
            "time" : 1418807404206
        }, {
            "event" : "serverAttached",
            "homeURL" : "http://127.0.0.1:7777/",
            "slaveURL" : "http://127.0.0.1:7777/__attester__/slave.html",
            "time" : 1418807404208
        }, {
            "event" : "taskStarted",
            "taskId" : 0,
            "taskName" : "test.sample.MySimpleClassTest",
            "slave" : {
                "userAgent" : "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.0 Safari/534.34",
                "address" : "127.0.0.1",
                "addressName" : null,
                "port" : 52364
            },
            "time" : 1418807404994
        }, {
            "event" : "taskStarted",
            "taskId" : 1,
            "taskName" : "test.sample.MySimpleClassTest2",
            "slave" : {
                "userAgent" : "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.0 Safari/534.34",
                "address" : "127.0.0.1",
                "addressName" : null,
                "port" : 52365
            },
            "time" : 1418807405029
        }, {
            "name" : "test.sample.MySimpleClassTest2",
            "testId" : 1,
            "time" : 1418807406139,
            "event" : "testStarted",
            "taskId" : 1
        }, {
            "name" : "test.sample.MySimpleClassTest2",
            "method" : "testAdd()",
            "testId" : 2,
            "parentTestId" : 1,
            "time" : 1418807406156,
            "event" : "testStarted",
            "taskId" : 1
        }, {
            "testId" : 2,
            "name" : "test.sample.MySimpleClassTest2",
            "method" : "testAdd()",
            "time" : 1418807406159,
            "event" : "testFinished",
            "duration" : 3,
            "taskId" : 1
        }, {
            "testId" : 1,
            "name" : "test.sample.MySimpleClassTest2",
            "asserts" : 1,
            "time" : 1418807406160,
            "event" : "testFinished",
            "duration" : 21,
            "taskId" : 1
        }, {
            "name" : "test.sample.MySimpleClassTest",
            "testId" : 1,
            "time" : 1418807406173,
            "event" : "testStarted",
            "taskId" : 0
        }, {
            "time" : 1418807406175,
            "event" : "coverage",
            "taskId" : 1
        }, {
            "event" : "taskFinished",
            "taskId" : 1,
            "time" : 1418807406181
        }, {
            "name" : "test.sample.MySimpleClassTest",
            "method" : "testAdd()",
            "testId" : 2,
            "parentTestId" : 1,
            "time" : 1418807406190,
            "event" : "testStarted",
            "taskId" : 0
        }, {
            "testId" : 2,
            "name" : "test.sample.MySimpleClassTest",
            "method" : "testAdd()",
            "time" : 1418807406193,
            "event" : "testFinished",
            "duration" : 3,
            "taskId" : 0
        }, {
            "testId" : 1,
            "name" : "test.sample.MySimpleClassTest",
            "asserts" : 1,
            "time" : 1418807406194,
            "event" : "testFinished",
            "duration" : 21,
            "taskId" : 0
        }, {
            "time" : 1418807406206,
            "event" : "coverage",
            "taskId" : 0
        }, {
            "event" : "taskFinished",
            "taskId" : 0,
            "time" : 1418807406211
        }, {
            "event" : "campaignFinished",
            "time" : 1418807406212
        }]);