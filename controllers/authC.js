const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    role,
    password,
  });

  sendEmailConfirmation(user, req, res, next);
});

// @desc      Resend Email Confirmation
// @route     PUT /api/v1/auth/resendemailconfirm
// @access    Public
exports.resendEmailConfirm = asyncHandler(async (req, res, next) => {
  if (!req.query.email) {
    return next(new ErrorResponse("Please provide a email", 404));
  }
  const user = await User.findOne({ email: req.query.email });
  sendEmailConfirmation(user, req, res, next);
});

// @desc      Confirm email
// @route     GET /api/v1/auth/confirmemail/:confirmtoken
// @access    Public
exports.confirmEmail = asyncHandler(async (req, res, next) => {
  const { confirmtoken } = req.params;

  if (!confirmtoken || confirmtoken.split(".").length != 2) {
    return next(new ErrorResponse("Invalid Token", 400));
  }

  const confirmationToken = confirmtoken.split(".")[0];

  const confirmEmailToken = crypto.createHash("sha256").update(confirmationToken).digest("hex");

  const user = await User.findOne({
    confirmEmailToken,
    confirmEmailExpire: { $gt: Date.now() },
    isEmailConfirmed: false,
  });

  if (!user) {
    return next(new ErrorResponse("Invalid Token", 400));
  }

  // Update confirmation
  user.confirmEmailToken = undefined;
  user.confirmEmailExpire = undefined;
  user.isEmailConfirmed = true;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // validate email and password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // check for user
  const user = await User.findOne({ email }).select("+password");
  // console.log(user.password);

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 400));
  }

  // check for password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 400));
  }

  // Check user is verified or not
  if (!user.isEmailConfirmed) {
    return next(new ErrorResponse("Email is not verified. Verify your email first.", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {
  res
    .cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      data: {},
    });
});

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // user is already available in req due to the protect middleware
  const user = req.user;
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  // update password
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Forgot Password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(`There is no user with email ${req.body.email}`, 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click below to reset your password : \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset request",
      message,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Reset Email could not be sent", 500));
  }

  res.status(200).json({ success: true, data: "Reset Email sent" });
});

// @desc      Reset Password of user
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get hashed token
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid request", 404));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

// Get token from model, and send email confirmation email to user email
const sendEmailConfirmation = async (user, req, res, next) => {
  // Check if used is already verified or not
  if (user.isEmailConfirmed) {
    return next(new ErrorResponse(`User ${user.id} is already verified.`, 400));
  }

  // Get token
  const confirmEmailToken = user.generateEmailConfirmToken();

  // Create confirm email url and send to email
  const confirmEmailUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/confirmemail/${confirmEmailToken}`;

  const message = `We are happy to have you onboard. Please click below to confirm your email : \n\n ${confirmEmailUrl} \n\n Thank You to join us ! \n\n Happy journey!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Email Confirmation",
      message,
    });
  } catch (err) {
    user.confirmEmailToken = undefined;
    user.confirmEmailExpire = undefined;

    user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email Confirmation could not be sent", 500));
  }

  user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
};
