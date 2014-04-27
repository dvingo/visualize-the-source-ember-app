var Directory = require('../models/directory');

exports.list = function(req, res, next) {
  Directory.getAll(function(err, directories) {
    if (err) return next(err);
    res.json({ directories: directories });
  });
};

exports.tree = function(req, res, next) {
  Directory.getTree(req.params.id, function(err, directoryTree) {
    if (err) return next(err);
    res.json(directoryTree);
  });
};

exports.allRoots= function(req, res, next) {
  Directory.getAllRootNodes(function(err, nodes) {
    res.json({'projects': nodes});
  });
};
