var path = require('path');
var fs = require('fs');

var root = {};

module.exports = function (runner) {
  var status = {
    pass: 0,
    fail: 0,
    pending: 0
  };

  runner.on('start', function() {
    var value = fs.readFileSync(path.join(__dirname, 'docs/header.html'), "utf8");
    console.log(value);
  });


  runner.on('end', function() {
    displayHTML(root);
    var value = fs.readFileSync(path.join(__dirname, 'docs/footer.html'), "utf8");
    // make sure to close previous div
    var totals = '</div><div class="endStyle">'+
      '<div>Total: '+(status.pass+status.fail+status.pending)+'</div>'+
      '<div style="color: DarkGreen;">Passed: ' + status.pass + '</div>' +
      '<div style="color: DarkRed;">Failed: ' + status.fail + '</div>' +
      '<div style="color: DarkOrange;">Pending: ' + status.pending + '</div>' +
    '</div>';

    value = totals+value;
    console.log(value);
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
        tests += '<table cellspacing="0" cellpadding="0">'+
          '<tr onclick="showHide(\''+parentReference+'err'+errorcount+'\', \''+parentReference+'\')" class="'+parentReference+' failed">' +
            addIndentation(depth+1) + // tests reside one step deaper than its parent suite
            '<td class="duration">'+ test.duration + ' ms</td>'+
            '<td class="title hypertext">'+ test.title + '</td>' +
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
        tests += '<table cellspacing="0" cellpadding="0">'+
          '<tr class="'+parentReference+' passed" >' +
            addIndentation(depth+1) + // tests reside one step deaper than its parent suite
            '<td class="duration">'+ test.duration + ' ms</td>'+
            '<td class="title">'+ test.title + '</td>' +
            '<td class="passedState">Passed</td>' +
          '</tr>'+
        '</table>';

      } else if (test.pending) {
        status.pending++;
        tests += '<table cellspacing="0" cellpadding="0">'+
          '<tr class="'+parentReference+' pending" >' +
            addIndentation(depth+1) +
            '<td class="duration">0 ms</td>'+
            '<td class="title">'+ test.title + '</td>' +
            '<td class="pendingState">Pending</td>' +
          '</tr>'+
        '</table>';
      }
    });

    var result = generateResult(suite);
    var display = '';
    display += '<table cellspacing="0" cellpadding="0">'+
      '<tr onclick="showHide(\''+title+depth+'\', \''+ptitle+(depth-1)+'\')" class="'+ptitle+(depth-1)+' suite">'+
        addIndentation(depth) +
        '<td style="width: auto" class="hypertext">'+ suite.title + '</td>' +
        '<td class="subTotal" style="color: DarkGreen;">Pass: ' + result.pass + '</td>' +
        '<td class="subTotal" style="color: DarkRed;">Fail: ' + result.fail + '</td>' +
        '<td class="subTotal" style="color: DarkOrange;">Pend: ' + result.pending + '</td>' +
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
  suite.suites.forEach(function(sub, index, array) {
    displayHTML(sub);
  });
}

var generateResult = function(suite) {
  var result = { pass: 0, fail: 0, pending: 0 };

  suite.suites.forEach(function(sub, index, array) {
    var reTotal = generateResult(sub);
    result.pass += reTotal.pass;
    result.fail += reTotal.fail;
    result.pending += reTotal.pending;
  });

  suite.tests.forEach(function(test, index, array) {
    if (test.pending) result.pending++;
    else if (test.state == 'failed') result.fail++;
    else if (test.state == 'passed') result.pass++;
  });

  return result;
}