var Directory = require('../models/directory');

exports.list = function(req, res, next) {
  Directory.getAll(function(err, directories) {
    if (err) return next(err);
    res.json({ directories: directories });
  });
};

exports.show = function(req, res, next) {
  Directory.get(req.params.id, function(err, directoryTree) {
    if (err) return next(err);
    res.json(directoryTree);
  });
};
