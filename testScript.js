var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');

// Instantiate a Mocha instance.
var mocha = new Mocha();
mocha.reporter(require("./reporter.js"));

var testDir = './testData.js'

mocha.addFile(testDir);

// Run the tests.
mocha.run(function (failures) {
    process.on('exit', function () {
        process.exit(failures);  // exit with non-zero status if there were failures
    });
});

