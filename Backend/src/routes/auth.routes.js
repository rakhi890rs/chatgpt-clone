const express = require('express');
const { registerUser, loginUser, getCurrentUser, logoutUser } = require('../controllers/auth.controller');
const { authUser } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authUser, getCurrentUser);
router.post("/logout", logoutUser);

module.exports = router;