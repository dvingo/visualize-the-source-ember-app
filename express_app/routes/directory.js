var Directory = require('../models/directory');

exports.list = function(req, res, next) {
  Directory.getAll(function(err, directories) {
    if (err) return next(err);
    res.json({ directories: directories });
  });
};

exports.tree = function(req, res, next) {
  if (req.query.type === 'tree') {
    Directory.getTree(req.query.id, function(err, directoryTree) {
      if (err) return next(err);
      res.json(directoryTree);
    });
  } else if (req.query.type === 'force') {
    Directory.getForce(req.query.id, function(err, directoryTree) {
      if (err) return next(err);
      res.json(directoryTree);
    });
  }
};
