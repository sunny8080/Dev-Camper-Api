const mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course name']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: Number,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add minimum skill required'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }

});

CourseSchema.statics.getAverageCost = async function (bootcampId) {
  // console.log('calculating average cost'.blue);

  const obj = await this.aggregate(
    [
      {
        $match: { bootcamp: bootcampId }
      },
      {
        $group: {
          _id: '$bootcamp',
          averageCost: { $avg: '$tuition' }
        }
      }
    ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: obj.length ? Math.ceil(obj[0].averageCost / 10) * 10 : 0
    });
  } catch (err) {
    console.log(err);
  }
}



// call getAverageCost after save
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// call getAverageCost before delete
CourseSchema.pre('deleteOne', { document: true, query: false }, function (next) {
  this.constructor.getAverageCost(this.bootcamp);
  next()
});


module.exports = mongoose.model('Course', CourseSchema);

