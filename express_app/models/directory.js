var neo4j = require('neo4j');
var deepcopy = require('deepcopy');
var db = new neo4j.GraphDatabase(
  process.env['NEO4J_URL'] ||
  'http://localhost:7474'
);

// Private constructor.
var Directory = module.exports = function Directory(_node) {
  this._node = _node;
};

// Public instance properties.

Object.defineProperty(Directory.prototype, 'id', {
  get: function() { return this._node.id; }
});

Object.defineProperty(Directory.prototype, 'name', {
    get: function () {
        return this._node.data['name'];
    }
});

Directory.prototype.toJson = function() {
   return {
     id: this._node.id,
     name: this.name
   };
};

//
// Returns the given directory and three levels of descendants
// in the format expected by Ember-data.
//
Directory.get = function(directoryId, callback) {
  var query = [
    "MATCH (d:Directory)<-[:PARENT]-(child1)",
    "WHERE d._id = {directoryId}",
    "WITH d, child1",
    "OPTIONAL MATCH (child1)<-[:PARENT]-(child2)",
    "WITH d, child1, child2",
    "OPTIONAL MATCH (child2)<-[:PARENT]-(child3)",
    "RETURN d, child1, child2, child3"
  ].join('\n');

  var params = { directoryId: directoryId };
  db.query(query, params, function(err, results) {
    if (err) return callback(err);
    parseDataForForceDiagram(results, function(directoryTree) {
      console.log('calling callback;');
      callback(null, directoryTree);
    });
    //parseDirectoriesFromDB(results, function(directoryTree) {
      //callback(null, directoryTree);
    //});
  });
};

parseDataForForceDiagram = function(resultsArray, callback) {
  var nodes = [], links = [], nodeIdToPosition = {}, root,
      linksAlreadyInserted = {};

  resultsArray.forEach(function(record) {
    root = record['d'];
    var child1 = record['child1'],
        child2 = record['child2'],
        child3 = record['child3'],
        source, target;

      if (child2 && child3) {
        //console.log('got 2 and 3: ', child2.data.name, ' ', child3.data.name);
        //console.log('got 1 and 2: ', child1.data.name, ' ', child2.data.name);
        ensureLinkExistsBetween(child2, child3);
        ensureLinkExistsBetween(child1, child2);
        ensureLinkExistsBetween(root, child1);
      } else if (child1 && child2) {
        ensureLinkExistsBetween(child1, child2);
        ensureLinkExistsBetween(root, child1);
      } else if (root && child1) {
        ensureLinkExistsBetween(root, child1);
      }
  });
  callback({directory: {
    name: root.data.name,
    id: root.data._id,
    d3Data: { nodes: nodes, links: links }
  }});

  function ensureLinkExistsBetween(parent, child) {
    if (!linkExistsBetween(parent, child)) {
      console.log("link doesn't exists between parent and child: ", parent.data.name, ' ', child.data.name)
      console.log();
      parentIndex = getNodeIndexEnsurePresent(parent);
      childIndex = getNodeIndexEnsurePresent(child);
      linksAlreadyInserted[linkKeyFunction(parent, child)] = true;
      links.push({source: parentIndex, target: childIndex});
    }
  }

  function getNodeIndexEnsurePresent(node) {
    if (nodeIdToPosition[node.data._id]) {
      return nodeIdToPosition[node.data._id];
    } else {
      console.log('node missing: ', node.data.name, ' ', node.data._id);
      console.log('entry in nodeIdToPosition: ', nodeIdToPosition[node.data._id]);
      console.log();
      n = nodes.length;
      nodes[n] = nodeToDict(node);
      nodeIdToPosition[node.data._id] = n;
      console.log('returning length of nodes: ', n);
      return n;
    }
  }

  function linkExistsBetween(parent, child) {
    parentIndex = getNodeIndex(parent, nodeIdToPosition);
    childIndex = getNodeIndex(child, nodeIdToPosition);
    if (!parentIndex || !childIndex) {
      return false;
    }
    return linksAlreadyInserted[linkKeyFunction(parent, child)];
  }

  function linkKeyFunction(parent, child) {
    return parent.data._id + '' + child.data._id;
  }
};

var getNodeInsertIfMissing = function(index, node, nodeList, nodeIdToPosition) {
  if (index) {
    return index;
  } else {
    n = nodeList.length;
    nodeList[n] = nodeToDict(node);
    nodeIdToPosition[node.data._id] = n;
    return n;
  }
};

var nodeToDict = function(obj) {
  if (obj.data.hasOwnProperty('content')) {
    content = obj.data.content;
    retVal = {'id': obj._id, 'name': obj.data.name, 'type': 'file'};//,
      //'content': obj.data.content};
  } else {
    retVal = {'id': obj._id, 'name': obj.data.name, 'type': 'directory'};
  }
  return retVal;
};

var getNodeIndex = function(node, nodeIdToIndex) {
  if (Object.keys(nodeIdToIndex).hasOwnProperty(node._id)) {
    return nodeIdToIndex[node._id];
  }
};

parseDirectoriesFromDB = function(resultsArray, callback) {
  var returnVal = {
    'directory': { 'type': 'directory' }
  },
  cache = {}
  firstLevelChildren = {};

  resultsArray.forEach(function(record) {
    var d = record['d'];
    returnVal.directory.id = record.d.id;
    returnVal.directory.name = record.d.data.name;
    var child1 = record['child1'];
    var child2 = record['child2'];
    var child3 = record['child3'];
    // Need to store the tree in a dict and then set that as the children.
    if (child1) {
      var obj = getOrPutFromCache(child1, cache);
      firstLevelChildren[obj.id] = obj;
      console.log('got child1: ', obj.id, ' ', obj.name);
    }
    if (child1 && child2) {
      var child1Obj = getOrPutFromCache(child1, cache);
      var child2Obj = getOrPutFromCache(child2, cache);
      if (firstLevelChildren.hasOwnProperty(child1Obj)) {
        existingChild1 = firstLevelChildren[child1Obj.id];
        if (!existingChild1.hasOwnPropety('children')) {
          existingChild1.children = [];
        }
        existingChild1.children.push(child2Obj);
      } else {
        if (!child1Obj.hasOwnProperty('children')) {
          child1Obj.children = [];
        }
        child1Obj.children.push(child2Obj);
        firstLevelChildren[child1Obj.id] = child1Obj;
      }
    }
    //if (child2) {
      //console.log('got child2: ', child2.id, ' ', child2.data.name);
    //}
    //if (child3) {
      //console.log('got child3: ', child3.id, ' ', child3.data.name);
    //}
    console.log('\n\n');
  });

  returnVal.directory.children = objToArray(firstLevelChildren);
  d3Data = deepcopy(returnVal.directory);
  returnVal.directory.d3Data = d3Data;
  callback(returnVal);
}

var getOrPutFromCache = function(obj, cache) {
  var id = obj.id, retVal, content;
  if (cache.hasOwnProperty(id)) {
    console.log('found id in cache for name: ', cache[id].name);
    return cache[id];
  }
  if (obj.data.hasOwnProperty('content')) {
    content = obj.data.content;
    retVal = {'id': obj.id, 'name': obj.data.name, 'type': 'file'};//,
      //'content': obj.data.content};
  } else {
    retVal = {'id': obj.id, 'name': obj.data.name, 'type': 'directory'};
  }
  cache[id] = retVal;
  return retVal;
}

objToArray = function(obj) {
  var retVal = [];
  for (k in obj)  {
    retVal.push(obj[k]);
  }
  return retVal;
}

Directory.getAll = function (callback) {
    var query = [
        'MATCH (d:Directory)',
        'RETURN d Limit 100',
    ].join('\n');

    db.query(query, null, function (err, results) {
        if (err) return callback(err);
        var directories = results.map(function (result) {
            return (new Directory(result['d'])).toJson();
        });
        callback(null, directories);
    });
};
