var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
  process.env['NEO4J_URL'] ||
  'http://localhost:7474'
);

var query = [
  "MATCH (f:File)",
  "WHERE f._id = {fileId}",
  "RETURN f._id as fileId, f.name AS fileName, f.content AS fileContent"
].join('\n');

exports.get = function(fileId, callback) {
  var params = { fileId: fileId };
  db.query(query, params, function(err, result) {
    if (err) return callback(err);
    transformData(result, function(fileData) {
      callback(null, fileData);
    });
  });
};

var transformData = function(record, callback) {
  var retVal = {}, data;
  if (record.length === 1) {
    data = record[0];
    retVal.name = data.fileName;
    retVal.content = data.fileContent;
    retVal.id = data.fileId;
    retVal.type = 'file';
  }
  callback(retVal);
}
