export default Ember.Route.extend({
  alreadySearched: false,
  model: function() {
    if (!this.get('alreadySearched')) {
      this.toggleProperty('alreadySearched');
      return this.store.find('project');
    } else{
      return this.store.all('project');
    }
  },
  actions: {
    willTransition: function(transition) {
      var directoryId = transition.intent.contexts[0].id;
      var self = this;
      this.store.find('directory', directoryId).then(function(data) {
        self.transitionTo('vis', data);
      });
    }
  }
});
