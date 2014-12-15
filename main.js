var path = require('path');
var fs = require('fs');

var root = {};

module.exports = function (runner) {
  var status = {
    pass: 0,
    fail: 0,
    pending: 0,
    duration: 0
  };

  runner.on('end', function() {
    console.log('<html>'); // start doc
    var value = fs.readFileSync(path.join(__dirname, 'docs/header.html'), "utf8"); // get header file
    console.log(value); // write header
    console.log('<body>'); // start body

    var totalTests = status.pass+status.fail+status.pending;

    var totals = '<div style="height:120px;"><div class="totalsLeft">'+
      '<div class="innerDiv" style="color: black">Run Time: ' + getTime(status.duration) + '</div>' +
      '<div class="innerDiv">Total: '+totalTests+'</div>'+
      '<div class="innerDiv" style="color: DarkGreen;">Passed: ' + status.pass + '</div>' +
      '<div class="innerDiv" style="color: DarkRed;">Failed: ' + status.fail + '</div>' +
      '<div class="innerDiv" style="color: DarkBlue;">Pending: ' + status.pending + '</div>' +
    '</div>';
    console.log(totals);

    var width = 695;
    var passWidth = (status.pass / totalTests) * width;
    var failWidth = (status.fail / totalTests) * width;
    var pendWidth = (status.pending / totalTests) * width;

    var percentages = '<div class="totalsRight" style="width: '+width+'px;">' +
          '<div class="innerDiv" style="width:'+passWidth+'px; background-color: DarkGreen; height:50px; float:left;">'+((status.pass / totalTests)*100).toFixed(0)+'%</div>' +
          '<div class="innerDiv" style="width:'+failWidth+'px; background-color: DarkRed; height:50px; float:left;">'+((status.fail / totalTests)*100).toFixed(0)+'%</div>' +
          '<div class="innerDiv" style="width:'+pendWidth+'px; background-color: DarkBlue; height:50px; float:left;">'+((status.pending / totalTests)*100).toFixed(0)+'%</div>' +
      '</div></div>';
    console.log(percentages);

    console.log('<div id="reportTable">'); // table div
    displayHTML(root); // print table
    console.log('</div></body></html>'); // close the report 
  });

  runner.on('suite', function(suite) {
    // calculate nesting level
    var depth = 0;
    var object = suite;
    while (!object.root) {
      depth++;
      object = object.parent;
    }
    suite.depth = depth;
  });

  runner.on('suite end', function(suite) {
    if (suite.root) { // do not do anything if its the root
      root = suite;
      return;
    }

    var depth = suite.depth;

    var errorcount = 0;
    var title = removeSpecialChars(suite.title);
    var ptitle = removeSpecialChars(suite.parent.title);

    var tests = '';
    suite.tests.forEach(function(test, index, array) {
      var parentReference = title+depth;
      var state = test.state

      if (state == 'failed') {
        status.fail++;
        errorcount++;
        status.duration += (test.duration != undefined) ? test.duration : 0;
        tests += '<table cellspacing="0" cellpadding="0">'+
          '<tr id="'+parentReference+'err'+errorcount+'" onclick="showHide(\''+parentReference+'err'+errorcount+'\', \''+parentReference+'\')" class="'+parentReference+' failed">' +
            addIndentation(depth+1) + // tests reside one step deaper than its parent suite
            '<td id="image" class="expanded"></td>' +
            '<td class="duration">'+ test.duration + ' ms</td>'+
            '<td class="title">'+ test.title + '</td>' +
            '<td class="failedState">Failed</td>' +
          '</tr>'+
        '</table>';

        tests += '<table cellspacing="0" cellpadding="0">' +
          '<tr class="'+parentReference+'err'+errorcount+' failed">' +
            addIndentation(depth+2) +
            '<td class="failDetail">'+
              '<pre style="font-family: \'Courier New\', Courier, monospace;">'+
                '<code>' + test.err + '</code>'+
              '</pre>'+
            '</td>'+
          '</table>';
      
      } else if (state == 'passed') {
        status.pass++;
        status.duration += (test.duration != undefined) ? test.duration : 0;
        tests += '<table cellspacing="0" cellpadding="0">'+
          '<tr class="'+parentReference+' passed" >' +
            addIndentation(depth+1) + // tests reside one step deaper than its parent suite
            '<td class="durationPorP">'+ test.duration + ' ms</td>'+
            '<td class="title">'+ test.title + '</td>' +
            '<td class="passedState">Passed</td>' +
          '</tr>'+
        '</table>';

      } else if (test.pending) {
        status.pending++;
        tests += '<table cellspacing="0" cellpadding="0">'+
          '<tr class="'+parentReference+' pending" >' +
            addIndentation(depth+1) +
            '<td class="durationPorP">0 ms</td>'+
            '<td class="title">'+ test.title + '</td>' +
            '<td class="pendingState">Pending</td>' +
          '</tr>'+
        '</table>';
      }
    });

    var result = generateResult(suite);
    var display = '';
    display += '<table cellspacing="0" cellpadding="0">'+
      '<tr id="'+title+depth+'" onclick="showHide(\''+title+depth+'\', \''+ptitle+(depth-1)+'\')" class="'+ptitle+(depth-1)+' suite">'+
        addIndentation(depth) +
        '<td id="image" class="expanded"></td>' +
        '<td class="title">'+ suite.title + '</td>' +
        '<td class="subTotal" style="color: DarkGreen;">Pass: ' + result.pass + '</td>' +
        '<td class="subTotal" style="color: DarkRed;">Fail: ' + result.fail + '</td>' +
        '<td class="subTotal" style="color: DarkBlue;">Pend: ' + result.pending + '</td>' +
        '<td class="subTotal" style="color: black; width: 120px;">'+ getTime(result.duration) + '</td>' +
      '</tr></table>';
    display += tests;

    suite.htmlDisplay = display;
  });

  runner.on('fail', function(test, err){
      test.err = err;
  });
}

var addIndentation = function(indent) {     
  indent = indent-1;
  var data = '';
  for (var i=0; i<indent; i++) {
    
    var color = (16*i) + 56;
    var colorText = 'rgb('+color+','+color+','+color+')'
    data += '<td style="background-color: '+colorText+';" class="indent"></td>';
  }
  return data;
}

var removeSpecialChars = function(text) {
  var chars = '\.!@#$%^&\*()+=[]{}\\\'\"\s<>/';

  for (var i=0; i<chars.length; i++) {
    var value = chars[i];
    var re = new RegExp('\\'+value,'g');
    text = text.replace(re, '');
  }

  return text;
}

var displayHTML = function(suite) {
  if (suite.htmlDisplay) console.log(suite.htmlDisplay);
  if (suite.suites == undefined) return;
  suite.suites.forEach(function(sub, index, array) {
    displayHTML(sub);
  });
}

var generateResult = function(suite) {
  var result = { pass: 0, fail: 0, pending: 0, duration: 0 };

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

  return days+'d'+' '+hours+':'+minutes+':'+seconds+':'+ms;
}