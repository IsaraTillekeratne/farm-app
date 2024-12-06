const express = require('express');
const router = express.Router();
const cattleOwnerController = require('../controllers/cattleOwnerController');
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Register a new CattleOwner
router.post('/register', cattleOwnerController.registerCattleOwner);

// Login a CattleOwner
router.post('/login', cattleOwnerController.loginCattleOwner);

// Book an appointment
router.post('/book/appointment', authenticate, authorize(["owner"]), cattleOwnerController.bookAppointment);

// Cancel an appointment
router.patch('/cancel/appointment', authenticate, authorize(["owner"]), cattleOwnerController.cancelAppointment);

// Get All Farms
router.get('/details/farms', authenticate, authorize(["owner"]), cattleOwnerController.getAllFarms);

// Get All Veterinarians
router.get('/details/veterinarians', authenticate, authorize(["owner"]), cattleOwnerController.getAllVeterinarians);

// Get owned Livestock
router.get('/livestock', authenticate, authorize(["owner"]), cattleOwnerController.getOwnedLiveStock);

// Get appointments
router.get('/appointments', authenticate, authorize(["owner"]), cattleOwnerController.getAppointments);

// Get Invoices
router.get('/invoices', authenticate, authorize(["owner"]), cattleOwnerController.getInvoices);

// Get Certificates
router.get('/certificates', authenticate, authorize(["owner"]), cattleOwnerController.getCertificates);

module.exports = router;
