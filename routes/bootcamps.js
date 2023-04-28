const express = require("express");
const router = express.Router();
const { getBootCamps, getBootCamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampInRadius, bootcampPhotoUpload } = require("../controllers/bootcampsC");
const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')

const { protect, authorize } = require('../middleware/auth')

router.route("/")
  .get(advancedResults(Bootcamp, 'courses'), getBootCamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route("/:id")
  .get(getBootCamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

// include other resource routers
const courseRouter = require('./courses');

// re-route into other resource courses
router.use('/:bootcampId/courses', courseRouter)

module.exports = router;
