![](http://i1343.photobucket.com/albums/o790/Benjamin_Pratt/Untitled_zpsfd5ab49c.png)

## Basic install and use
```
npm install good-mocha-html-reporter

mocha -R good-mocha-html-reporter ./testpath
```

### Modes

* Compact (Shows every test without detail)

    ```
        Login
            √ navigate to site <2180>
            √ type email address <160>
            √ type password <70>
            √ click the login button <80>
            √ wait for login <663>
            x handle popups <9>
    ```

* Silent  (Shows errors only)

    ```
        x handle popups <9>
            Blah Blah error message/stacktrace printout of death
    ```

* Verbose (Shows every test in detail)

    ```
        Login
            √ navigate to site <2180>
            √ type email address <160>
                Something a user has logged. This will be grey
        contrasting the basic green and red text.

        I am currently in the process of fixing indentation 
            √ type password <70>
            √ click the login button <80>
            √ wait for login <663>
            x handle popups <9>
                Blah Blah error message/stacktrace printout of death
   ```

* HTML_OUT (Dumps HTML to console)

### Output Path

By defult the path is set to the execution folder and will kick out a file called report.html
```
// execution folder
~\workspace> mocha -R good-mocha-html-reporter ./test

// output
~\workspace\report.html
```

Alternatively you can use command line arguments:

```
-p    or    --report-path
-m    or    --report-mode

~/workspace> mocha -R good-mocha-html-reporter -p reports/myTestReport.html -m Compact ./test

// output
~\workspace\reports\myTestReport.html
```

Your final option is in the mocha.opts config file / options object
```
{
    reporter: 'good-mocha-html-reporter', //good-mocha-html-reporter, spec, nyan
    timeout: 15000,
    bail: false,
    savePath: '', // the path to desired location
    filename: 'report.html', // filename gets attached at the end of savePath
    mode: 'Verbose'
}
```

### Additional Logging

I have claimed the variable name `log` from mochas context object. The log element is of type string and
is displayed after the its test passes.

```
  describe('Login', function(){
    it('type email address', function(){
        this.log = 'Something a user has logged.\n\nI am currently in the process of fixing indentation'
    })
  })
```
