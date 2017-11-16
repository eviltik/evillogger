# evillogger
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

nodejs winston based logger


Installation
------------
```
$ npm install evillogger
```


Usage
-----
```js
var log = require('evilloger')('myProcessName');

log.info('info !',{foo:'bar'});
log.warn('warn !!');
log.error(new Error('huhu'));

// will be shown only if DEBUG env var not empty
// or if you pass --debug as argument
log.debug('debug ...');
```

stdout
------
