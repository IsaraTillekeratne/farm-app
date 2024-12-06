const express = require('express');
const router = express.Router();
const slaughterhouseEmpController = require('../controllers/slaughterhouseEmpController');
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Register in Slaughterhouse employee
router.post('/register', slaughterhouseEmpController.registerSlaughterhouseEmp);

// Log in Slaughterhouse employee
router.post('/login', slaughterhouseEmpController.loginSlaughterhouseEmp);

// Scan RFID chip and flag livestock as deceased
router.patch('/scanRFID', authenticate, authorize(["slaught"]), slaughterhouseEmpController.markAsDeceased);

// // Generate and download post-mortem report
// router.get('/generatePostMortemReport/:livestockId', authMiddleware('SlaughterhouseEmp'), slaughterhouseEmpController.generatePostMortemReport);

module.exports = router;
