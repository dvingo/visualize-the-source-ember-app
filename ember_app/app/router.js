var Router = Ember.Router.extend(); // ensure we don't share routes between all Router instances

Router.map(function() {
  this.route('component-test');
  this.route('helper-test');
  this.route('tree', {'path': '/tree/:id'});
  this.route('force-tree', {'path': '/force-tree/:id'});
});

Router.reopen({
  location: 'history'
});

export default Router;
