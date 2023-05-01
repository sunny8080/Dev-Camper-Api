const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');
const Bootcamp = require('../models/Bootcamp')
const Review = require('../models/Review')


// @desc      Get all reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/bootcamps/:bootcampId/reviews
// @access    Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    })
  }
  return res.status(200).json(res.advancedResults);
});


// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!review) {
    return next(new ErrorResponse(`No review found with the id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: review
  })
});


// @desc      Add review
// @route     POST /api/v1/bootcamp/:bootcampId/reviews
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`No bootcamp found with the id ${req.params.bootcampId}`, 404));
  }

  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const review = await Review.create(req.body);

  res.status(200).json({
    success: true,
    data: review
  })
});


// @desc      Update review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  // TODO - try to do same thing with findOneAndUpdate query middleware 
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404));
  }

  // Make sure user is bootcamp owner or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this review`, 401))
  }

  const preBootCampId = review.bootcamp;

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // update average rating of bootcamp, if update contains rating
  if (req.body.rating) Review.getAverageRating(review.bootcamp);

  // update average rating of new and old bootcamp, if update contains bootcamp
  if (req.body.bootcamp) {
    Review.getAverageRating(review.bootcamp);
    Review.getAverageRating(preBootCampId);
  }

  res.status(200).json({
    success: true,
    data: review
  })
});



// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review found with the id ${req.params.id}`, 404));
  }

  // Make sure review belongs to current user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this review from bootcamp`, 401))
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    data: review
  });
});



