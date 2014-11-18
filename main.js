var path = require('path');
var fs = require('fs');

var lastdepth = -1; 
var visited = [];

module.exports = function (runner) {
  var status = {
    pass: 0,
    fail: 0,
    pending: 0
  };

  var suites = '';

  runner.on('start', function() {
    var value = fs.readFileSync(path.join(__dirname, 'docs/header.html'), "utf8");
    console.log(value);
  });


  runner.on('end', function() {
    var value = fs.readFileSync(path.join(__dirname, 'docs/footer.html'), "utf8");
    // make sure to close previous div
    var totals = '</div><div class="endStyle">'+
      '<div>Total: '+(status.pass+status.fail+status.pending)+'</div>'+
      '<div style="color: DarkGreen;">Passed: ' + status.pass + '</div>' +
      '<div style="color: DarkRed;">Failed: ' + status.fail + '</div>' +
      '<div style="color: #9A9A9A;">Pending: ' + status.pending + '</div>' +
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
    if (suite.root) return; // do not do anything if its the root

    var depth = suite.depth;
    if (lastdepth == -1) lastdepth = depth;
    setupVisitedArray(depth);

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

    var thisSuite = '';
    thisSuite += '<table cellspacing="0" cellpadding="0">'+
      '<tr onclick="showHide(\''+title+depth+'\', \''+ptitle+(depth-1)+'\')" class="'+ptitle+(depth-1)+' suite">'+
        addIndentation(depth) +
        '<td style="width: auto" class="hypertext">'+ suite.title + '</td>'  +
      '</tr></table>';
    thisSuite += tests;

    suites = (visited[depth] == 1)? suites+thisSuite : thisSuite+suites;
    visited[depth] = 1;
    lastdepth = depth;

    if (suite.depth == 1) { // reset the stored suites for the next heirarchy
      console.log(suites);
      suites = '';
      return;
    }
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

var setupVisitedArray = function(depth) {
  while(visited.length <= depth) {
    visited.push(0);
  }

  for(var i=lastdepth; i<depth; i++){
    visited[i] = 0;
  }
}