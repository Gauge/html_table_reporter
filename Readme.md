|TODO											    |Status   	|
| ------------------------------------------------- | --------- |
|Display suites in hierarchy              		    |Complete 	|
|Display tests for each suite             		    |Complete 	|
|Display tests errors on fail             		    |Complete 	|
|Display final test results                         |Complete 	|
|Display sub test results                 		    |Complete 	|
|Create collapable rows                   		    |Complete 	|
|Add a super sweet graph or something    		    |Complete	|
|Make it easier to set the default output path 	    |In Progress|
|Add color and test duration to texutal report 	    |Complete   |


## Basic install and use
```
npm install html_table_reporter

mocha -R html_table_reporter ./testpath
```

### Modes
    * silent (only outputs errors)


### Output Path

By defult the path is set to the execution folder and will kick out a file called report.html
```
// execution folder
C:\workspace> mocha -R html_table_reporter ./test

// output
C:\workspace\report.html
```
You can changed the path by going to `node_modules\html_table_reporter\config.js` and dictating a relative or full path (relative to the execution path)


### Output Types
Step one generates genaric textual output to the command line:
```
Mocha HTML Table Reporter v1.6.2
NOTE: Tests sequence must complete to generate html report


Basic Sanity Test
  Login
    + navigate to site
    + type email address
    + type password
    + click the login button
    + wait for login
  Logout
    + click the logout button
    + wait for login screen



Writing file to: report.html
To change the output directory or filename go to: C:\workspace\node_modules\html_table_reporter\config.js

```

Step two generates an html document:

![](http://i1343.photobucket.com/albums/o790/Benjamin_Pratt/Untitled_zpsfd5ab49c.png)
