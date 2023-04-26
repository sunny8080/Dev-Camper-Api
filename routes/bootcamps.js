const express = require("express");
const router = express.Router();
const { getBootCamps, getBootCamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampInRadius, bootcampPhotoUpload } = require("../controllers/bootcampsC");

router.route("/")
  .get(getBootCamps)
  .post(createBootcamp);

router.route("/:id")
  .get(getBootCamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);

router.route('/:id/photo').put(bootcampPhotoUpload)

// include other resource routers
const courseRouter = require('./courses');

// re-route into other resource courses
router.use('/:bootcampId/courses', courseRouter)

module.exports = router;
