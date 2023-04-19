const express = require("express");
const router = express.Router();
const { getBootCamps, getBootCamp, createBootcamp, updateBootcamp, deleteBootcamp } = require("../controllers/bootcampsC");

router.route("/")
  .get(getBootCamps)
  .post(createBootcamp);

router.route("/:id")
  .get(getBootCamp)
  .put(createBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
