const express = require("express");
const { register, confirmEmail, resendEmailConfirm, login, logout, getMe, forgotPassword, resetPassword, updateDetails, updatePassword } = require("../controllers/authC");
const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.get("/confirmemail/:confirmtoken", confirmEmail);
router.put("/resendemailconfirm", resendEmailConfirm);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);

module.exports = router;
