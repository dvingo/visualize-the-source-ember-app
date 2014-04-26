var neo4j = require('neo4j');
var deepcopy = require('deepcopy');
var db = new neo4j.GraphDatabase(
  process.env['NEO4J_URL'] ||
  'http://localhost:7474'
);

var parsers = require('./parsers');
var parseDataForTreeDiagram = parsers.parseDataForTreeDiagram;

// Private constructor.
var Directory = module.exports = function Directory(_node) {
  this._node = _node;
};

Directory.prototype.toJson = function() {
  return {
    id: this._node.id,
    name: this.name
  };
};

var query = [
   "MATCH (d:Directory)<-[:PARENT]-(child)",
   "WHERE d._id = {directoryId}",
   "RETURN d AS parent, labels(d) as parent_labels, child as child, labels(child) as child_labels",
   "UNION",
   //"MATCH (d:Directory)<-[:PARENT*1..2]-(parent)<-[:PARENT]-(child)",
   "MATCH (d:Directory)<-[:PARENT*]-(parent)<-[:PARENT]-(child)",
   //"MATCH (d:Directory)<-[:PARENT]-(parent)<-[:PARENT]-(child)",
   "WHERE d._id = {directoryId}",
   "RETURN parent AS parent, labels(parent) as parent_labels, child as child, labels(child) as child_labels"
].join('\n');

Directory.getTree = function(directoryId, callback) {
  var params = { directoryId: directoryId };
  db.query(query, params, function(err, results) {
    if (err) return callback(err);
    parseDataForTreeDiagram(results, function(directoryTree) {
      callback(null, directoryTree);
    });
  });
};

Directory.getAllRootNodes = function(callback) {
  var query = [
      "MATCH (n:Directory)",
      "WHERE n.isRoot = true",
      "RETURN n"].join("\n");
  db.query(query, null, function(err, results) {
    if (err) return callback(err);
    console.log('got results: ', results);
    var returnVal = results.map(function(r) {
      console.log('got data: ', r.n.data);
      return { 'id': r.n.data._id, 'name': r.n.data.name };
    });
    console.log('returnVal: ', returnVal);
    callback(null, returnVal);
  });
}
