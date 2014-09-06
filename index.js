'use strict';

var utils = require('./pouch-utils');
var version = require('./version');

exports.adapters = {};
//exports.adapters.readableStream = require('./readable-stream');
exports.adapters.writableStream = require('./writable-stream');

exports.plugin = {};

exports.plugin.dump = utils.toPromise(function (writableStream, callback) {
  var self = this;

  var PouchDB = self.constructor;

  var output = new PouchDB(self._db_name, {
    stream: writableStream,
    adapter: 'writableStream'
  });

  self.info().then(function (info) {
    var header = {
      version: version,
      db_type: self.type(),
      start_time: new Date().toJSON(),
      db_info: info
    };
    writableStream.write(JSON.stringify(header) + '\n');
  }).then(function () {
    return self.replicate.to(output);
  }).then(function () {
    return output.close();
  }).then(function () {
    callback(null, {ok: true});
  }).catch(function (err) {
    callback(err);
  });
});

exports.plugin.load = utils.toPromise(function (callback) {
  callback(null, 'hello');
});

/* istanbul ignore next */
if (typeof window !== 'undefined' && window.PouchDB) {
  window.PouchDB.plugin(exports.plugin);
  //window.PouchDB.adapter('readableStream', exports.adapters.readableStream);
  window.PouchDB.adapter('writableStream', exports.adapters.writableStream);
}
