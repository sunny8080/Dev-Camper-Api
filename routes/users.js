const express = require("express");
const { getUsers, getUser, createUser, updateUser, deleteUser } = require("../controllers/usersC");
const User = require("../models/User");

const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

router.use(protect).use(authorize("admin"));

router.route("/")
  .get(advancedResults(User), getUsers)
  .post(createUser);

router
  .route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
