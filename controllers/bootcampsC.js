exports.getBootCamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: "All bootcamps" });
};

exports.getBootCamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Show bootcamp ${req.params.id}` });
};

exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: "create bc" });
};

exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `updated bc ${req.params.id}` });
};

exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Bc deleted ${req.params.id}` });
};
