const express = require('express');
const router = express.Router();
const veterinarianController = require('../controllers/veterinarianController');
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Register Veterinarian
router.post('/register', veterinarianController.registerVeterinarian);

// Log in Veterinarian
router.post('/login', veterinarianController.loginVeterinarian);

// Get appointments
router.get('/appointments', authenticate, authorize(["vet", "vetadmin"]), veterinarianController.getAppointments);

// Get all Livestock
router.get('/details/livestock', authenticate, authorize(["vet", "vetadmin"]), veterinarianController.getAllLiveStock);

// Get all Farms
router.get('/details/farms', authenticate, authorize(["vet", "vetadmin"]), veterinarianController.getAllFarms);

// Get all Cattle Owners
router.get('/details/cattleOwners', authenticate, authorize(["vet", "vetadmin"]), veterinarianController.getAllCattleOwners);

// Add new livestock
router.post('/add/livestock', authenticate, authorize(["vet", "vetadmin"]), veterinarianController.addLivestock);

// Add new veterinarian (only for admins)
router.post('/add/vets', authenticate, authorize(["vetadmin"]), veterinarianController.addVeterinarian);

// Get all Vets
router.get('/details/vets', authenticate, authorize(["vetadmin"]), veterinarianController.getAllVeterinarians);

// Update a vet
router.put('/edit/vet', authenticate, authorize(["vetadmin"]), veterinarianController.editVeterinarian);

// Get the veterinarian needs for a farm location
router.get('/location/need', authenticate, authorize(["vetadmin"]), veterinarianController.getVeterinarianNeed);

// Complete an appointment
router.patch('/complete/appointment', authenticate, authorize(["vet", "vetadmin"]), veterinarianController.completeAppointment);

// // Get task schedule (protected)
// router.get('/schedule', authMiddleware, veterinarianController.getTaskSchedule);

// // Add new livestock (protected)
// router.post('/livestock', authMiddleware, veterinarianController.addLivestock);

// // Verify farm visit completion (protected)
// router.post('/verifyVisit', authMiddleware, veterinarianController.verifyFarmVisit);

// // Administrative: Add new veterinarian (for admins only)
// router.post('/addVeterinarian', authMiddleware, veterinarianController.addVeterinarian);

module.exports = router;
