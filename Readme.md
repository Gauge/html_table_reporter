![](http://i1343.photobucket.com/albums/o790/Benjamin_Pratt/Untitled_zpsfd5ab49c.png)

## Basic install and use
```
npm install html_table_reporter

mocha -R html_table_reporter ./testpath
```

### Modes

    You can change the modes in the config file `node_modules/html_table_reporter/config.js`.

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


### Additional Logging

    I have claimed the variable name `log` from the mochas context object. The log element is of type string and
    is displayed after the its test passes.

    ```
      describe('Login', function(){
        it('type email address', function(){
            this.log = 'Something a user has logged.\n\nI am currently in the process of fixing indentation'
        })
      })
    ```

### Output Path

By defult the path is set to the execution folder and will kick out a file called report.html
```
// execution folder
~\workspace> mocha -R html_table_reporter ./test

// output
~\workspace\report.html
```
You can changed the path by going to `node_modules\html_table_reporter\config.js` and dictating a relative or full path (relative to the execution path)