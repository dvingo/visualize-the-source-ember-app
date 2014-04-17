export default Ember.Route.extend({
  model: function(params) {
    return this.store.find('directory', {type: 'force', id: params.id}).then(function(data) {
      return data.get('content')[0];
    });
  }
});
