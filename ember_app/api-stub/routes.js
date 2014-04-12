module.exports = function(server) {

  // Create an API namespace, so that the root does not
  // have to be repeated for each end point.
  server.namespace('/api', function() {

    server.get('/directories/:id', function(req, res) {
      var directory = {
        "directory": {
          "id": "1",
          "name": "Test Directory",
          "d3Data": {"id": "1", "name": "Test Directory"}
        }
      };
      res.send(directory);
    });
  });
};
