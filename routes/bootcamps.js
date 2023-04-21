const express = require("express");
const router = express.Router();
const { getBootCamps, getBootCamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampInRadius } = require("../controllers/bootcampsC");

router.route("/")
  .get(getBootCamps)
  .post(createBootcamp);

router.route("/:id")
  .get(getBootCamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius)

module.exports = router;
