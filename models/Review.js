const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for the review"],
    maxLength: 100,
  },
  text: {
    type: String,
    trim: true,
    required: [true, "Please add some text"],
    maxLength: 1000,
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating between 1 and 10"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Prevent user from submitting more than one review per bootcamp, by creating bootcamp and user as index
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj.length ? Math.floor(obj[0].averageRating) : undefined,
    });
  } catch (err) {
    console.log(err);
  }
};

// call getAverageRating after save
ReviewSchema.post("save", async function () {
  await this.constructor.getAverageRating(this.bootcamp);
});

// call getAverageRating after delete
ReviewSchema.post("deleteOne", { document: true, query: false }, async function (next) {
  await this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
