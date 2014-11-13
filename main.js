module.exports = function (runner) {
  var passes = 0;
  var failures = 0;

  var hierarchy = [];
  var title = '';
  var ptitle = '';
  var suiteID = 0;
  var parentID = 0;
  var errorcount = 0;

  var table = '<table cellspacing="0" cellpadding="0">';

  runner.on('start', function() {
    
    var text = 
    '<html>' +
      '<head>' +
        '<style type="text/css">' +
          'body {background-color: SeaShell}' +
          'table {border-collapse: collapse; margin-left: auto; margin-right: auto; width: 70%; background-color: #E7EDF5; table-layout: fixed;}'+
          'th, td {border: 1px solid black; word-break: break-word;}' +
          '.indent {width:10px;}' +
          '.duration {width: 50px;}' +
          '.title  {width: auto;}' +
          '.passState {color: white; background-color: DarkGreen; width: 45px; text-align: right;}' +
          '.failState {color: white; background-color: DarkRed; width: 45px; text-align: right;}' +
          '.pass {background-color: #33CC66;}' +
          '.fail {background-color: #E0A7A7;}' +
          '.failDetail {width: auto; word-wrap: break-word;}' +
          '.hypertext {text-decoration: underline; color: blue;}' +
          '.endStyle {text-align: center; background-color: #E7EDF5; width: 150px; margin-left: auto; margin-right: auto;}' +
        '</style>' +
        '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>' +
        '<script>var showHide = function(id,pid) { var element = $("."+id); var pelement = $("."+pid); if (pelement.css("display") == "none") { element.toggle(false); element.click(); } else { element.toggle(); if (element.css("display") == "none") {element.click();}}}</script>' +
      '</head><body>';

    console.log(text);
  });


  runner.on('end', function() {

    var text = '<div class="endStyle">'+
      '<div>Total: '+(passes+failures)+'</div>'+
      '<div style="color: DarkGreen;">Passed: ' + passes + '</div>' +
      '<div style="color: DarkRed;">Failed: ' + failures + '</div>' +
    '</div></body></html>';
    
    console.log(text);
  });

  runner.on('suite', function(suite) {

    title = removeSpecialChars(suite.title);
    ptitle = (suite.parent) ? removeSpecialChars(suite.parent.title) : '';
    errorcount = 0;
    
    if (title != '' && ptitle == ''){
      suiteID = 0;
      parentID = 0;
      hierarchy = [title];
    } else {
      parentID = hierarchy.indexOf(ptitle);
      suiteID = parentID+1;
      hierarchy.splice(suiteID, hierarchy.length);
      hierarchy.push(title);
    }

    if (title != '') {
      var text = table+'<tr onclick="showHide(\''+title+suiteID+'\', \''+ptitle+parentID+'\')" class="'+ptitle+parentID+' section">'+
        addIndentation(suiteID) +
        '<td style="width: auto" class="hypertext">'+ suite.title + '</td>'  +
      '</tr></table>';

      console.log(text);
    }
  });

  runner.on('pass', function(test) {
    passes++;
    var data = table+'<tr class="'+title+suiteID+' pass" >' +
      addIndentation(suiteID+1) +
      '<td class="duration">'+ test.duration + 'ms</td>'+
      '<td class="title">'+ test.title + '</td>' +
      '<td class="passState">'+ test.state + '</td>' +
    '</tr></table>';

    console.log(data);

  });

  runner.on('fail', function(test, err){
    failures++;
    errorcount++;
    var data = table+'<tr onclick="showHide(\''+title+suiteID+'err'+errorcount+'\', \''+title+suiteID+'\')" class="'+title+suiteID+' fail">' +
      addIndentation(suiteID+1) +
      '<td class="duration"></td>' +
      '<td class="title hypertext">'+ test.title + '</td>' +
      '<td class="failState">'+ test.state + '</td>' +
    '</tr></table>';

    data += table+'<tr class="'+title+suiteID+'err'+errorcount+' fail">' +
      addIndentation(suiteID+2) +
      '<td class="failDetail"><pre style="font-family: \'Courier New\', Courier, monospace;"><code>' + err + '</code></pre></td></table>';

    console.log(data);
  });
}

var addIndentation = function(indent) {     
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

module.exports.test = function() {
  var fs = require('fs');
  var doc = fs.readFileSync('./header.html');
  // add other data
  console.log(doc);
}