const { json } = require("express");
const ErrorResponse = require("../utils/ErrorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;



  // log for dev
  console.log(err);
  // console.log(err.name.red);
  // console.log(err.code);

  // mongoose bad objectId
  if (err.name === 'CastError') {
    const message = `Bootcamp not found with id ${err.value}`;
    error = new ErrorResponse(message, 404)
  }

  // mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate value entered.`
    error = new ErrorResponse(message, 400)
  }

  // mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(", ");
    error = new ErrorResponse(message, 400)
  }

  res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Server Error' })
}

module.exports = errorHandler;
