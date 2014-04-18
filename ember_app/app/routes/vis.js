export default Ember.Route.extend({
  type: null,
  model: function(params) {
    this.set('type', params.type);
    return this.store.find('directory', {type: params.type, id: params.id}).then(function(data) {
      return data.get('content')[0];
    });
  },
  renderTemplate: function() {
    var t = this.get('type');
    if (t === 'tree') {
      this.render('tree');
    } else if (t === 'force') {
      this.render('force-tree');
    }
  }
});
