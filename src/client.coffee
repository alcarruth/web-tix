#!/usr/bin/env coffee
#
#  client.coffee
#

{ DB_RMI_Client } = require('web-worm-client')
{ db_schema } = require('./db_schema')
{ remote_options } = require('./settings')

client = new DB_RMI_Client(remote_options)

exports.client = client
if window?
  window.client = client
  
###
  # invoked from command line start REPL
  repl = require('repl')
  repl.start('client> ').context.client = client
###
