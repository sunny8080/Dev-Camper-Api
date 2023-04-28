const express = require("express");
const dotenv = require("dotenv");
const connectDB = require('./config/db')
const colors = require('colors');
const PORT = process.env.PORT || 5000;
const errorHandler = require("./middleware/error");
const path = require('path');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');
const morgan = require('morgan')

// load env vars
dotenv.config({ path: "./config/config.env" });
const app = express();

// connect to database
connectDB();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body parser
app.use(express.json());

// cookie parser
app.use(cookieParser());

// file uploading
app.use(fileupload());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));


// Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");

// mount bootcamps routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);


// error handler
app.use(errorHandler)

// app.listen(PORT, ()=>console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error : ${err.message}`.red);
  // close server & exit process
  // server.close(()=>process.exit(1));
})
