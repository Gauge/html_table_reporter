var path = require('path');
var fs = require('fs');
var colors = require('chalk');
var dust = require("dustjs-linkedin");

var root = {};

module.exports = function (runner, options) {
    
    runner.on('start', function () {
    });
    
    runner.on('suite', function (suite) {
        if (suite.root) {
            suite = applyGUID(suite);
            populateRoot(root, suite);
        }
    });
    
    runner.on('suite end', function (suite) {
    });
    
    /*runner.on('end', function (suite) {
        console.log(JSON.stringify(root));
    });*/
    
    process.on('exit', function () {
        root = applyStatus(root);
        console.log(JSON.stringify(root));
        
        var template = fs.readFileSync('./views/basic.html') + "";
        
        var compiled = dust.compile(template);
        var tmpl = dust.loadSource(compiled)
        dust.render(tmpl, root, function (err, out) {
            if (err) { 
                console.log(err);
            }

            fs.writeFileSync("./test.html", out, 'utf8');
        });
    });
    
    runner.on('pass', function (test) {
        test.status = "passed"
        test.duration = (test.duration == undefined) ? 0 : test.duration;
        var testData = populateTest(test);
    });
    
    runner.on('pending', function (test) {
        test.status = "pending";
        test.duration = (test.duration == undefined) ? 0 : test.duration;
        var testData = populateTest(test);
    });
    
    runner.on('fail', function (test, err) {
        test.status = "failed";
        test.duration = (test.duration == undefined) ? 0 : test.duration;
        test.error = err;
        var testData = populateTest(test);
    });
}

var applyStatus = function (suite) {
    
    for (var i = 0; i < suite.suites.length; i++) {
        suite.suites[i] = applyStatus(suite.suites[i]);
        var tempSuite = suite.suites[i];
        suite.status.passed += tempSuite.status.passed;
        suite.status.failed += tempSuite.status.failed;
        suite.status.pending += tempSuite.status.pending;
        suite.status.duration += tempSuite.status.duration;
    }

    for (var i = 0; i < suite.tests.length; i++) {
        var test = suite.tests[i];
        switch (test.status) {
            case "passed":
                suite.status.passed++
                break;
            case "failed":
                suite.status.failed++;
                break;
            case "pending":
                suite.status.pending++;
                break;
        }
        suite.status.duration += test.duration;
    }
    suite.status.durationFormated = getTime(suite.status.duration);
    return suite;
}

// recursivly applys guid to all suites
var applyGUID = function (suite) {
    if (suite.root) {
        suite.depth = -1;
    } else { 
        suite.depth = suite.parent.depth + 1;
    }
    
    for (var i = 0; i < suite.suites.length; i++) {
        suite.suites[i] = applyGUID(suite.suites[i]);
    }
    
    suite.guid = guid();
    return suite;
}

var populateRoot = function (data, suite, pGUID) {
    data.title = suite.title;
    data.pGUID = pGUID;
    data.guid = suite.guid;
    data.depth = suite.depth;
    data.view = {};
    data.view.depth = getIndentColor(suite.depth);
    data.suites = [];
    data.tests = [];
    data.status = {
        passed: 0,
        failed: 0,
        pending: 0,
        duration: 0
    };
    
    for (var i = 0; i < suite.suites.length; i++) {
        var tempSuite = {};
        populateRoot(tempSuite, suite.suites[i], data.guid);
        data.suites.push(tempSuite);
    }
}

var getDataModelEquivalent = function (suite) {
    var data = root;
    var path = [];
    
    // create a lookup path of guid
    var parent = suite;
    while (!parent.root) {
        path.push(parent.guid);
        parent = parent.parent;
    }
    path.reverse();
    
    // locates the mirror suite in the root data model
    for (var pathIndex = 0; pathIndex < path.length; pathIndex++) {
        for (var dataIndex = 0; dataIndex < data.suites.length; dataIndex++) {
            if (data.suites[dataIndex].guid == path[pathIndex]) {
                data = data.suites[dataIndex];
                break;
            }
        }
    }
    
    return data;
}

var populateTest = function (test) {
    
    var suite = getDataModelEquivalent(test.parent);
    
    // ensures that ctx will always exist
    if (test.ctx == undefined) {
        test.ctx = {};
    }
    
    suite.tests.push({
        title: test.title,
        status: test.status,
        duration: test.duration,
        durationFormated: getTime(test.duration), 
        error: test.error,
        log: test.ctx.log,
        depth: test.parent.depth + 1,
        subDepth: test.parent.depth + 2,
        pGUID: suite.guid,
        guid: guid(),
        view: {
            depth: getIndentColor(test.parent.depth + 1),
            subDepth: getIndentColor(test.parent.depth + 2),
        }
    });
    
    // clears the logged text for 
    test.ctx.log = undefined;
}


// generates global ids for element identification
var guid = (function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4() + '-' + s4();
    };
})();

var getIndentColor = function (depth) {
    if (depth < 0) return [];
    var arr = new Array(depth)
    // set indent color
    for (var i = 0; i < arr.length; i++) {
        arr[i] = (16 * i) + 56;
    }
    return arr;
}

var getTime = function (x) {
    ms = Math.floor(x % 1000);
    x /= 1000
    seconds = Math.floor(x % 60);
    x /= 60
    minutes = Math.floor(x % 60);
    x /= 60
    hours = Math.floor(x % 24);
    x /= 24
    days = Math.floor(x);
    
    return days + 'D ' + hours + ':' + minutes + ':' + seconds + ':' + ms;
}