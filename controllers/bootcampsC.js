const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');



// @desc      get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootCamps = asyncHandler(async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeField = ['select', 'sort', 'page', 'limit'];

  // loop over query and delete from query
  removeField.forEach(param => delete reqQuery[param]);

  // create query String and create operators ($gt, $lte, $in)
  let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in|eq)\b/g, match => `$${match}`);

  // Finding resources #IDK
  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  // select fields
  if (req.query.select) {
    const fields = req.query.select.split(', ').join(' ');
    query = query.select(fields);
  }

  // sort the query 
  if (req.query.sort) {
    const sortBy = req.query.select.split(', ').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt')
  }

  // pagination 
  // 0-based indexing // includes [startIndex, endIndex)
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const total = await Bootcamp.countDocuments();
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(page * limit, total);
  query = query.skip(startIndex).limit(limit);

  // Executing query
  const bootcamps = await query;

  // console.log(bootcamps[0]);
  // console.log(bootcamps[0].toJSON());
  // console.log(JSON.stringify(bootcamps[0]));

  // pagination result
  const pagination = {
    totalPage: Math.ceil(total / limit),
    pageNo: page,
    limit
  };

  if (endIndex < total) {
    pagination.next = { page: page + 1 }
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1 }
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  })
});

// #OLD
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
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`), 404);
  }

  bootcamp.deleteOne();
  res.status(200).json({ success: true, data: bootcamp })
});




// @desc      Get bootcamps within radius ( distance must be in km )
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
  const radius = distance / 6378

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })
});
