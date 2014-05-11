var File = require('../models/file');

exports.show = function(req, res, next) {
  File.get(req.params.id, function(err, returnFile) {
    if (err) return next(err);
    res.json({ file: returnFile });
  });
};
