var Directory = require('../models/directory');

exports.index = function(req, res) {
  Directory.getAllRootNodes(function(err, nodes) {
    res.json({'projects': nodes});
  });
};
