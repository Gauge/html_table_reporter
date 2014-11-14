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

  // where all the data is stored
  var doc = '';
  var suites = '';

  runner.on('start', function() {
    var value = fs.readFileSync(path.join(__dirname, 'docs/header.html'), "utf8");
    doc = value;
    console.log(value);
  });


  runner.on('end', function() {
    var value = fs.readFileSync(path.join(__dirname, 'docs/footer.html'), "utf8");
    doc += value;
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

      if (state == 'passed') status.pass++;
      if (state == 'failed') status.fail++;
      if (state == 'undefined') status.pending++; 

      if (state == 'failed') {
        errorcount++;
        tests += '<table cellspacing="0" cellpadding="0">'+
          '<tr onclick="showHide(\''+parentReference+'err'+errorcount+'\', \''+parentReference+'\')" class="'+parentReference+' failed">' +
            addIndentation(depth+1) + // tests reside one step deaper than its parent suite
            '<td class="duration">'+ test.duration + 'ms</td>'+
            '<td class="title hypertext">'+ test.title + '</td>' +
            '<td class="'+state+'State">'+ state + '</td>' +
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
      
      } else {
        tests += '<table cellspacing="0" cellpadding="0">'+
          '<tr class="'+parentReference+' '+state+'" >' +
            addIndentation(depth+1) + // tests reside one step deaper than its parent suite
            '<td class="duration">'+ test.duration + 'ms</td>'+
            '<td class="title">'+ test.title + '</td>' +
            '<td class="'+state+'State">'+ state + '</td>' +
          '</tr>'+
        '</table>';
      }
    });

    var text = '';
    text += '<table cellspacing="0" cellpadding="0">'+
      '<tr onclick="showHide(\''+title+depth+'\', \''+ptitle+(depth-1)+'\')" class="'+ptitle+(depth-1)+'">'+
        addIndentation(depth) +
        '<td style="width: auto" class="hypertext">'+ suite.title + '</td>'  +
      '</tr></table>';
    text += tests;

    suites = (visited[depth] == 1)? suites+text : text+suites;
    visited[depth] = 1;
    lastdepth = depth;

    if (suite.depth == 1) { // reset the stored suites for the next heirarchy
      doc += suites;
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
  var chars = '!@#$%^&\*()+=[]{}\\\'\"\s<>/';

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

  for(var i=lastdepth; i<visited.length; i++){
    visited[i] = 0;
  }
}