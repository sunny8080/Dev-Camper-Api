const express = require("express");
const dotenv = require("dotenv");
const connectDB = require('./config/db')
const colors = require('colors');
const PORT = process.env.PORT || 5000;

// load env vars
dotenv.config({ path: "./config/config.env" });
const app = express();

// connect to database
connectDB();



// Route files
const bootcamps = require("./routes/bootcamps");

// mount bootcamps routers
app.use("/api/v1/bootcamps", bootcamps);



// app.listen(PORT, ()=>console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error : ${err.message}`.red);
  // close server & exit process
  server.close(()=>process.exit(1));
})
