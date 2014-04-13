module.exports = function(server) {

  // Create an API namespace, so that the root does not
  // have to be repeated for each end point.
  server.namespace('/api', function() {

    server.get('/directories/:id', function(req, res) {
      var directory = {
        "directory": {
          "id": "1",
          "name": "Test Directory",
          "type": "directory",
          "children": [{"id": "1", "type": "file"}],
          "d3Data": {"id": "1", "name": "Test Directory",
            "children": [{
              "id": "1",
              "name": "Test File",
              "content": "This is test content"
            }]}
        },
        "file": {
          "id": "1",
          "name": "Test File",
          "type": "file",
          "content": "This is test content",
          "parent": {"id": "1", "type": "directory"}
        }
      };
      res.send(directory);
    });
  });
};
