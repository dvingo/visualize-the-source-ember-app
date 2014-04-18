var deepcopy = require('deepcopy');
var parseDataForTreeDiagram = function(listOfRecords, callback) {
  var cache = {}, root;
  listOfRecords.forEach(function(record) {
    var parent = extractDataIfPresent(record, 'parent', 'parent_labels'),
        child = extractDataIfPresent(record, 'child', 'child_labels');

    if (parent.isRoot) { root = parent }

    ensureNodesInCache(parent, child, cache);
    // add child to parent's 'children' property
    // ensure that it is added only if not present.
    // using references (i.e. the cache) will allow
    // us to build the nested dict structure without
    // needing to do the deep traversal ourselves.
  });
  console.log('cache length: ', Object.keys(cache).length);
  var returnData = tranformDataForEmber(root._id, cache);
  callback(returnData);
};

var tranformDataForEmber = function(rootId, cache) {
  root = cache[rootId];
  root.d3Data = deepcopy(root);
  return {directories: [root]};
};

var ensureNodesInCache = function(parent, child, cache) {
  parent = ensureNodeInCache(parent, cache);
  child = ensureNodeInCache(child, cache);
  ensureChildInChildrenList(parent, child);
};

var ensureNodeInCache = function(node, cache) {
  var key = getKey(node);
  if (key in cache) {
    return cache[key];
  }
  node.id = node._id;
  delete node._id;
  cache[key] = node;
  return node;
};

var ensureChildInChildrenList = function(parent, child) {
  var children;
  if ('children' in parent) {
    children = parent.children;
    ensureChildPropertiesSet(parent, child);
    addChildIfMissing(parent, child);
  } else {
    parent.children = [];
    parent.children.push(child);
  }
};

var addChildIfMissing = function(parent, child) {
  var childPresent = parent.children.filter(function(c) {
    return c.id === child.id;
  });
  if (childPresent.length === 0) {
    parent.children.push(child);
  }
};

var ensureChildPropertiesSet = function(parent, child) {
  if (!('parent' in child)) {
    child.parent = {'id': parent._id, 'type': parent.type};
  }
};

var getKey = function(node) {
  return node['_id'];
};

var extractDataIfPresent = function(record, key, label_key) {
  var data, label;
  if (key in record && record[key]) {
    data = record[key].data;
    label = record[label_key][0].toLowerCase();
    data.type = label;
    return data;
  }
  return null;
};
var parseDataForForceDiagram = function(resultsArray, callback) {
  var nodes = [], links = [], nodeIdToPosition = {}, root,
      linksAlreadyInserted = {};

  resultsArray.forEach(function(record) {
    root = record['d'];
    var child1 = record['child1'],
        child2 = record['child2'],
        child3 = record['child3'],
        source, target;

      if (child2 && child3) {
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
  callback({directories: [{
    name: root.data.name,
    id: root.data._id,
    d3Data: { nodes: nodes, links: links }
  }]});

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

  function getNodeIndex(node, nodeIdToIndex) {
    if (Object.keys(nodeIdToIndex).hasOwnProperty(node._id)) {
      return nodeIdToIndex[node._id];
    }
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

module.exports = {
  parseDataForTreeDiagram: parseDataForTreeDiagram,
  parseDataForForceDiagram: parseDataForForceDiagram
};
