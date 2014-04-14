export default Ember.Route.extend({
  model: function(params) {
    return this.store.find('directory', params.id);
  }
});
