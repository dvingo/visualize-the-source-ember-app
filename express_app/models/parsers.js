var deepcopy = require('deepcopy');
var parentType = 'parent';
var childType = 'child';
var parseDataForTreeDiagram = function(listOfRecords, callback) {
  var cache = {}, root;
  listOfRecords.forEach(function(record) {
    var parent = extractDataIfPresent(record, parentType),
        child = extractDataIfPresent(record, childType);

    if (parent.isRoot) { root = parent }

    ensureNodesInCache(parent, child, cache);
    // add child to parent's 'children' property
    // ensure that it is added only if not present.
    // using references (i.e. the cache) will allow
    // us to build the nested dict structure without
    // needing to do the deep traversal ourselves.
  });
  var returnData = tranformDataForEmber(root.id, cache);
  callback(returnData);
};

var tranformDataForEmber = function(rootId, cache) {
  var directories = [], files = [], root;
  for (key in cache) {
    var item = cache[key];
    if (item.type === 'directory') {
      directories.push(item);
    } else if (item.type === 'file') {
      files.push(item);
    }
  }
  root = cache[rootId];
  return { directories: directories, files: files, root: root };
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
  //node.id = node._id;
  //delete node._id;
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
    parent.children.push(getPolymorphicProperties(child));
  }
};

var addChildIfMissing = function(parent, child) {
  var childPresent = parent.children.filter(function(c) {
    return c.id === child.id;
  });
  if (childPresent.length === 0) {
    parent.children.push(getPolymorphicProperties(child));
  }
};

var ensureChildPropertiesSet = function(parent, child) {
  if (!('parent' in child)) {
    child.parent = {'id': parent.id, 'type': parent.type};
  }
  //if (child.hasOwnProperty('content') && !child.hasOwnProperty('numLines')) {
    //var m = child.content.match(/\n/g);
    //if (m) {
      //child.numLines = m.length || 0;
    //} else {
      //child.numLines = 0;
    //}
  //}
};

var getKey = function(node) {
  return node['id'];
};

var getPolymorphicProperties= function(node) {
  return { 'id': node.id, 'type': node.type };
};

var extractDataIfPresent = function(record, recordType) {
  //var data = {}, label,
      //map = keyToValues[recordType] key;
  var data = {};

  if (recordType === parentType) {
    data.id = record.parentId;
    data.name = record.parentName;
    data.type = record.parentLabels[0].toLowerCase();
    data.isRoot = record.isRoot;
  } else if (recordType === childType) {
    data.id = record.childId;
    data.name = record.childName;
    data.type = record.childLabels[0].toLowerCase();
    data.isRoot = false;
  }

  if (data.type === 'file') {
    data.content = '';
    data.numLines = 10;
  }
  return data;

    //if (key in record && record[key]) {
      //data = record[key].data;
      //label = record[labelKey][0].toLowerCase();
      //data.type = label;
      //return data;
    //}
  //}
  //return null;
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
      n = nodes.length;
      nodes[n] = nodeToDict(node);
      nodeIdToPosition[node.data._id] = n;
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
