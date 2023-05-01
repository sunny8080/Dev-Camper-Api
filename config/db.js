const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  // check if required or not // TODO
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false,
  // useUnifiedTopology: true
  if (process.env.NODE_ENV === "development") {
    console.log(`Mongodb connected : ${conn.connection.host}}`.cyan.underline.bold);
  }
};

module.exports = connectDB;
