var log = require('../')({ns:'myProcessName',repl:true, spaces:50});

log.info('info !',{foo:'bar'});
log.warn('warn !!');
log.error(new Error('huhu'));

// will be shown only if DEBUG env var not empty
// or if you pass --debug as argument
log.debug('debug ...');
