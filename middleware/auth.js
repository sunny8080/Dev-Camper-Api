const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("./async");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  /**
   * There are two way to handle session (for login or logout) , jwt token or cookies
   * 1. if jwt token is chosen, then it is client side responsibility to send token (Bearer token) in req.headers
   * each time when a request is made, also it is client side responsibility to clear or delete token when user logged out
   * 2. if cookies way is chosen, then it is server side responsibility to handle token at login and logout
   */

  /**
   * Here bearer token way is used, so it is upto client, how he use it, in case of login and logout
   * To set a bearer token in postman, add these lines in Tests section of a tab, and create a environment variable TOKEN
   * pm.environment.set("TOKEN", pm.response.json().token);
   * To get automatic bearer token, go to authorization tab in postman and set Type to Bearer Token, and add Token and {{TOKEN}}
   */

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    // set token from bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }
  // else if (req.cookies.token) {
  //   // set token from cookies
  //   token = req.cookies.token;
  // }

  // make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);

    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
    }

    next();
  };
};
