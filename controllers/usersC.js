const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/async');
const User = require('../models/User')


// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});


// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: user
  });
});


// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});



// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  // User.findOneAndUpdate(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id ${req.params.id}`, 404));
  }

  const fieldsToUpdate = ['name', 'email', 'role', 'password'];

  fieldsToUpdate.forEach((prop) => {
    if (prop in req.body) {
      user[prop] = req.body[prop];
    }
  })

  await user.save();

  user.password = undefined;

  res.status(200).json({
    success: true,
    data: user
  });
});


// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: user
  });
})

