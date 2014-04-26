export default Ember.Route.extend({ 
  model: function() {
    return $.get('localhost:3000/api/').then(function(data) {
      return data.nodes;
    });
  }
});
