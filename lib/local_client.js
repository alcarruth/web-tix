// Generated by CoffeeScript 2.4.1
(function() {
  //!/usr/bin/env coffee

  //  web-tix/src/client.coffee

  var DB_RMI_Client, client, db_schema, local_options, repl;

  ({DB_RMI_Client} = require('web-worm/client'));

  ({db_schema} = require('./db_schema'));

  ({local_options} = require('./settings'));

  client = new DB_RMI_Client(db_schema, local_options);

  if (module.parent) {
    module.exports = client;
  } else {
    // invoked from command line start REPL
    repl = require('repl');
    repl.start('client> ').context.client = client;
  }

}).call(this);