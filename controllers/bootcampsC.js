const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');


// @desc      get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootCamps = asyncHandler(async (req, res, next) => {
  let queryStr = JSON.stringify(req.query).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  let query = Bootcamp.find(JSON.parse(queryStr));
  const bootcamps = await query;
  res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps })
});

// OLD
// exports.getBootCamps =  async (req, res, next) => {
//   try {
//     const bootcamps = await Bootcamp.find();
//     res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps })
//   } catch (err) {
//     next(err)
//   }
// };




// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`), 404);
  }
  res.status(200).json({ success: true, data: bootcamp })
});





// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp })
});




// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`), 404);
  }
  res.status(200).json({ success: true, data: bootcamp })
});



// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`), 404);
  }
  res.status(200).json({ success: true, data: bootcamp })
});




// @desc      Get bootcamps within radius ( distance must be in miles )
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // get latitude, longitude from geocoder
  const loc = await geocoder.geocode(zipcode);
  console.log(loc);
  const [lat, lng] = [loc[0].latitude, loc[0].longitude];

  // cal radius in radians
  // radians = distance_in_mile / earth_radius_in_mile
  // Earth radius : 3963 mi or 6378 km
  const radius = distance / 3963

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })
});
