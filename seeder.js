const fs = require('fs');
const mongoose = require('mongoose')
const colors = require('colors');
const dotenv = require('dotenv')

// load env variables
dotenv.config({ path: './config/config.env' })

// load models
const Bootcamp = require('./models/Bootcamp')

// connect to db
mongoose.connect(process.env.MONGO_URI);

// read json files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

// import to DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log(`Data imported`.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
}



// delete from db
// WARNING : all data will be deleted from Bootcamp db
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log(`Data deleted`.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
}

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
