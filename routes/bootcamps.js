const express = require("express");
const router = express.Router();
const { getBootCamps, getBootCamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampInRadius, bootcampPhotoUpload } = require("../controllers/bootcampsC");
const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')

const {protect} = require('../middleware/auth')

router.route("/")
  .get(advancedResults(Bootcamp, 'courses'), getBootCamps)
  .post(protect, createBootcamp);

router.route("/:id")
  .get(getBootCamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);

router.route(protect, '/:id/photo').put(bootcampPhotoUpload)

// include other resource routers
const courseRouter = require('./courses');

// re-route into other resource courses
router.use('/:bootcampId/courses', courseRouter)

module.exports = router;
