var path = require('path');
var fs = require('fs');
var colors = require('chalk');

var root = {};

var COMPACT = "COMPACT",
    VERBOSE = "VERBOSE",
    SILENT = "SILENT",
    HTML_OUT = "HTML";

var config = {
    /*
        Modes: COMPACT, VERBOSE, SILENT, HTML_OUT

        COMPACT: Displays passed in compact and errors in compact
        VERBOSE: Displays passed with detail and errors with detail
        SILENT: Displays only errors with detail
        HTML_OUT: Prints html data to command line

    */
    path: '', // full or relative path (relative to your execution folder)
    filename: 'report.html',
    mode: 'VERBOSE'
};

module.exports = function(runner, options) {
    var status = {
        pass: 0,
        fail: 0,
        pending: 0,
        duration: 0
    };

    // initialize configuration
    config.path = options.savePath || config.path;
    config.filename = options.filename || config.filename;
    config.mode = options.mode || config.mode;

    for (var i=0; (i+1)<process.argv.length; i++) {
        if (process.argv[i] == '--report-path' || process.argv[i] == '-p') {
            var list = process.argv[i+1].split('/');
            var temp_path = '';
            for (var i2=0; i2<list.length-1; i2++) {
                temp_path += list[i2] + '/';
            }

            config.filename = list[list.length-1];
            config.path = temp_path;
        }

        if (process.argv[i] == '--report-mode' || process.argv[i] == '-m') config.mode = process.argv[i+1];
    }
    config.mode = config.mode.toUpperCase();


    runner.on('start', function() {
        if (config.mode != HTML_OUT) {
            console.log('Mocha HTML Table Reporter v2.0.1\nNOTE: Tests sequence must complete to generate html report');
            console.log("Run Mode: " + config.mode + "\n");
        }
    });

    var onEnd = function () {
        var value = fs.readFileSync(path.join(__dirname, 'header.html'), "utf8"); // get header file
        var doc = '<html><head>' + value + '</head><body>'; // start doc
        var width = 695;
        var totalTests = status.pass + status.fail + status.pending;
        var passWidth = ((status.pass / totalTests) * width).toFixed(0);
        var failWidth = ((status.fail / totalTests) * width).toFixed(0);
        var pendWidth = ((status.pending / totalTests) * width).toFixed(0);
        var passPercent = Math.floor((status.pass / totalTests) * 100);
        var failPercent = Math.floor((status.fail / totalTests) * 100);
        var pendingPercent = Math.floor((status.pending / totalTests) * 100);
        if (passPercent + failPercent + pendingPercent == 99) failPercent++;

        var totals = '<div style="height:120px;"><div class="totalsLeft">' +
            '<div class="innerDiv" style="color: black">Run Time: ' + getTime(status.duration) + '</div>' +
            '<div class="innerDiv">Total: ' + totalTests + '</div>' +
            '<div class="innerDiv" style="color: DarkGreen;">Passed: ' + status.pass + '</div>' +
            '<div class="innerDiv" style="color: DarkRed;">Failed: ' + status.fail + '</div>' +
            '<div class="innerDiv" style="color: DarkBlue;">Pending: ' + status.pending + '</div>' +
            '</div>';
        doc += totals;

        var percentages = '<div class="totalsRight" style="width: ' + width + 'px;">' +
            '<div class="innerDiv" style="width:' + passWidth + 'px; background-color: DarkGreen; height:50px; float:left;">' + passPercent + '%</div>' +
            '<div class="innerDiv" style="width:' + failWidth + 'px; background-color: DarkRed; height:50px; float:left;">' + failPercent + '%</div>' +
            '<div class="innerDiv" style="width:' + pendWidth + 'px; background-color: DarkBlue; height:50px; float:left;">' + pendingPercent + '%</div>' +
            '</div></div>';
        doc += percentages;
        
        doc += '<div id="reportTable">' + displayHTML(root) + '</div></body></html>'; // compile tests and finish the doc

        if (config.mode == HTML_OUT) console.log(doc);

        if (config.mode != HTML_OUT) {
            var filePath;
            if (config.filename != '') {
                filePath = path.join(config.path, config.filename);
                if (config.path && !fs.existsSync(config.path)) fs.mkdirSync(config.path);
            }

            console.log('\n');

            if (filePath) {
                try {
                    fs.writeFileSync(filePath, doc, 'utf8'); // write out to report.html
                    console.log('Writing file to: ' + filePath);
                } catch (err) {
                    console.log(err.message);
                }
            } else {
                console.log('No file location and name was given');
            }
        }
    }

    //runner.on('end', onEnd.bind(null));
    process.on('exit', onEnd.bind(null));

    runner.on('suite', function(suite) {
        // calculate nesting level
        var depth = 0;
        var object = suite;
        while (!object.root) {
            depth++;
            object = object.parent;
        }
        suite.depth = depth;
        suite.guid = guid();

        if (!suite.root && config.mode != SILENT && config.mode != HTML_OUT) console.log(textIndent(depth) + suite.title);
    });

    runner.on('suite end', function(suite) {
        if (suite.root) { // do not do anything if its the root
            root = suite;
            return;
        }

        var depth = suite.depth;

        var id = suite.guid;
        var pid = suite.parent.guid;

        var tests = '';
        suite.tests.forEach(function(test, index, array) {
            var state = test.state

            if (state == 'failed') {
                status.fail++;
                status.duration += (test.duration != undefined) ? test.duration : 0;
                tests += '<table cellspacing="0" cellpadding="0">' +
                    '<tr id="' + id + 'err' + status.fail + '" onclick="showHide(\'' + id + 'err' + status.fail + '\', \'' + id + '\')" class="' + id + ' failed">' +
                    addIndentation(depth + 1) + // tests reside one step deaper than its parent suite
                    '<td id="image" class="expanded"></td>' +
                    '<td class="duration">' + test.duration + ' ms</td>' +
                    '<td class="title">' + test.title + '</td>' +
                    '<td class="failedState">Failed</td>' +
                    '</tr>' +
                    '</table>';

                tests += '<table cellspacing="0" cellpadding="0">' +
                    '<tr class="' + id + 'err' + status.fail + ' failed">' +
                    addIndentation(depth + 2) +
                    '<td class="failDetail">' +
                    '<pre style="font-family: \'Courier New\', Courier, monospace;">' +
                    '<code>' + ((test.log!=undefined) ? '|Test Logs|\n' + test.log + '\n' : '') + '|Error Message|\n' + test.err  + '</code>' +
                    '</pre>' +
                    '</td>' +
                    '</table>';

            } else if (state == 'passed') {
                status.pass++;
                status.duration += (test.duration != undefined) ? test.duration : 0;
                if (config.mode == SILENT) return; // if running silent mode dont print anything
                
                if (config.mode == VERBOSE && test.log != undefined) {

                     tests += '<table cellspacing="0" cellpadding="0">' +
                        '<tr id="' + id + 'pass' + status.pass + '" onclick="showHide(\'' + id + 'pass' + status.pass + '\', \'' + id + '\')" class="' + id + ' passed passlog">' +
                        addIndentation(depth + 1) + // tests reside one step deaper than its parent suite
                        '<td id="image" class="expanded"></td>' +
                        '<td class="duration">' + test.duration + ' ms</td>' +
                        '<td class="title">' + test.title + '</td>' +
                        '<td class="passedState">Passed</td>' +
                        '</tr>' +
                        '</table>';

                    tests += '<table cellspacing="0" cellpadding="0">' +
                        '<tr class="' + id + 'pass' + status.pass + ' passed">' +
                        addIndentation(depth + 2) +
                        '<td class=".passDetail">' +
                        '<pre style="font-family: \'Courier New\', Courier, monospace;">' +
                        '<code>' + test.log + '</code>' +
                        '</pre>' +
                        '</td>' +
                        '</table>';

                } else {
                    tests += '<table cellspacing="0" cellpadding="0">' +
                        '<tr class="' + id + ' passed" >' +
                        addIndentation(depth + 1) + // tests reside one step deaper than its parent suite
                        '<td class="durationPorP">' + test.duration + ' ms</td>' +
                        '<td class="title">' + test.title + '</td>' +
                        '<td class="passedState">Passed</td>' +
                        '</tr>' +
                        '</table>';
                }
                

            } else if (test.pending) {
                status.pending++;
                if (config.mode != SILENT) {
                    tests += '<table cellspacing="0" cellpadding="0">' +
                        '<tr class="' + id + ' pending" >' +
                        addIndentation(depth + 1) +
                        '<td class="durationPorP">0 ms</td>' +
                        '<td class="title">' + test.title + '</td>' +
                        '<td class="pendingState">Pending</td>' +
                        '</tr>' +
                        '</table>';
                }
            }
        });

        var result = generateResult(suite);
        var display = '';
        display += '<table cellspacing="0" cellpadding="0">' +
            '<tr id="' + id + '" onclick="showHide(\'' + id + '\', \'' + pid + '\')" class="' + pid + ' suite">' +
            addIndentation(depth) +
            '<td id="image" class="expanded"></td>' +
            '<td class="title">' + suite.title + '</td>' +
            '<td class="subTotal" style="color: DarkGreen;">Pass: ' + result.pass + '</td>' +
            '<td class="subTotal" style="color: DarkRed;">Fail: ' + result.fail + '</td>' +
            '<td class="subTotal" style="color: DarkBlue;">Pend: ' + result.pending + '</td>' +
            '<td class="subTotal" style="color: black; width: 120px;">' + getTime(result.duration) + '</td>' +
            '</tr></table>';
        display += tests;

        suite.htmlDisplay = display;
    });

    runner.on('pass', function(test) {
        var depth = test.parent.depth + 1;
        if (config.mode != SILENT && config.mode != HTML_OUT) {
            var output = colors.green(textIndent(depth) + '√ ' + test.title) + colors.gray(" <" + test.duration + ">");
            console.log(output);
        }

        if (config.mode == VERBOSE) {
            if (test.ctx == undefined) {
                test.ctx = {log:undefined};
            }
            test.log = test.ctx.log;
            test.ctx.log = undefined;

            if (test.log != undefined) {

                var temp = '';
                var list = test.log.split('\n');
                for (var i=0; i<list.length; i++) {
                    temp += '\n' + textIndent(depth + 1) + list[i];
                }

                var output = colors.grey(textIndent(depth+1) + temp);
                console.log(output);
            }
        }
    });

    runner.on('pending', function(test) {
        var depth = test.parent.depth + 1;
        if (config.mode != SILENT && config.mode != HTML_OUT) {
            var output = colors.cyan(textIndent(depth) + '» ' + test.title) + colors.gray(" <pending>");
            console.log(output);
        }
    });

    runner.on('fail', function(test, err) {
        test.err = err;
        var depth = test.parent.depth + 1;
        var output = '';
        if (config.mode != HTML_OUT) {

            if (config.mode == SILENT)
                output += textIndent(depth - 1) + test.parent.title + '\n';
            
            output += colors.red(textIndent(depth) + 'x ' + test.title) + colors.gray(" <" + ((test.duration) ? test.duration : "NaN") + ">");
            
            if (config.mode == SILENT || config.mode == VERBOSE) {
                if (test.ctx == undefined){
                    test.ctx = {log:undefined};
                }
                test.log = test.ctx.log;
                test.ctx.log = undefined;

                if (test.log != undefined) {
                    var list = test.log.split('\n');
                    var temp = "";
                    for (var i=0; i<list.length; i++) {
                        temp += '\n' + textIndent(depth + 1) + list[i];
                    }
                    output += colors.gray(((temp != '') ?'\n'+textIndent(depth + 1)+'|Test Logs|\n' + temp : '') + '\n' + textIndent(depth + 1) + '|Error Message|\n' + test.err);
                }
            }
            console.log(output);

        }
    });
}

var textIndent = function(indent) {
    indent = indent - 1;
    var data = '';
    for (var i = 0; i < indent; i++) {
        data += '  ';
    }
    return data;
}

var addIndentation = function(indent) {
    indent = indent - 1;
    var data = '';
    for (var i = 0; i < indent; i++) {

        var color = (16 * i) + 56;
        var colorText = 'rgb(' + color + ',' + color + ',' + color + ')'
        data += '<td style="background-color: ' + colorText + ';" class="indent"></td>';
    }
    return data;
}

var guid = (function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4() + '-' + s4();
    };
})();


var displayHTML = function(suite) {
    doc = '';
    if (suite.htmlDisplay) doc += suite.htmlDisplay;
    if (suite.suites == undefined) return doc;
    suite.suites.forEach(function(sub, index, array) {
        doc += displayHTML(sub);
    });
    return doc;
}

var generateResult = function(suite) {
    var result = {
        pass: 0,
        fail: 0,
        pending: 0,
        duration: 0
    };

    suite.suites.forEach(function(sub, index, array) {
        var reTotal = generateResult(sub);
        result.pass += reTotal.pass;
        result.fail += reTotal.fail;
        result.pending += reTotal.pending;
        result.duration += reTotal.duration;
    });

    suite.tests.forEach(function(test, index, array) {
        if (test.pending) result.pending++;
        else if (test.state == 'failed') result.fail++;
        else if (test.state == 'passed') result.pass++;
        result.duration += (test.duration != null) ? test.duration : 0;

    });

    return result;
}

var getTime = function(x) {
    ms = Math.floor(x % 1000);
    x /= 1000
    seconds = Math.floor(x % 60);
    x /= 60
    minutes = Math.floor(x % 60);
    x /= 60
    hours = Math.floor(x % 24);
    x /= 24
    days = Math.floor(x);

    return days + 'd' + ' ' + hours + ':' + minutes + ':' + seconds + ':' + ms;
}
