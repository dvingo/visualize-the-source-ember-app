export default DS.RESTSerializer.extend({
  extractSingle: function(store, primaryType, payload) {

    function getFullObject(child) {
      if (child.type === 'directory') {
        return copy(payload.directories.filter(function(d) {
          return d.id === child.id;
        })[0]);
      } else if (child.type === 'file') {
        return copy(payload.files.filter(function(f) {
          return f.id === child.id;
        })[0]);
      }
    }

    function copyWithoutChildren(obj) {
      var retVal = {}, key;
      for (key in obj) {
        if (key === 'children') {
          retVal[key] = [];
        }
        retVal[key] = obj[key];
      }
      return retVal;
    }

    function copy(obj) {
      var retVal = {}, key;
      for (key in obj) {
        retVal[key] = obj[key];
      }
      return retVal;
    }

    /// Assumes obj has children of the form:
    /// [{ 'id': 'agdfd', 'type': 'file|dir' }].
    function populateChildren(obj) {
      var newChildren = [];
      if (obj.hasOwnProperty('children')) {
        obj.children.forEach(function(child) {
          var fullChild = getFullObject(child);
          newChildren.push(fullChild);
          if (child.type === 'directory') {
            populateChildren(fullChild);
          }
        });
      }
      obj.children = newChildren;
    }

    var newPayload,
        rootDir,
        root = copyWithoutChildren(payload.root);

    populateChildren(root);

    payload.directories.forEach(function(d) {
      store.push('directory', d);
    });

    payload.files.forEach(function(f) {
      store.push('file', f);
    });

    rootDir = payload.root;
    rootDir.d3TreeData = root;
    newPayload = {'directory': rootDir};
    return this._super(store, primaryType, newPayload);
  }
});
