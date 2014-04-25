export default DS.RESTSerializer.extend({
  extractArray: function(store, primaryType, payload) {
    console.log('in extract array. primaryType: ', primaryType);
    console.log('in extract array. payload: ', payload);
    var newPayload = {'directories': [payload.root]};

    payload.directories.forEach(function(d) {
      store.push('directory', d);
    });

    payload.files.forEach(function(f) {
      store.push('file', f);
    });
    return this._super(store, primaryType, newPayload);
  }
});
