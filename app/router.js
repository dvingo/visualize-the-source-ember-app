var Router = Ember.Router.extend(); // ensure we don't share routes between all Router instances

Router.map(function() {
  this.route('component-test');
  this.route('helper-test');
  this.route('vis', {'path': '/vis/:id/'});
});

Router.reopen({
  location: 'history'
});

export default Router;
