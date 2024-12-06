const express = require('express');
const router = express.Router();
const paaFEmpController = require('../controllers/paaFEmpController');
const { authenticate, authorize } = require("../middlewares/authMiddleware");

// Register PAAF employee
router.post('/register', paaFEmpController.registerPAAFEmp);

// Log in PAAF employee
router.post('/login', paaFEmpController.loginPAAFEmp);

// View cattle owner records
router.get('/details/cattleOwners', authenticate, authorize(["paaf", "paafadmin"]), paaFEmpController.viewCattleOwnerRecords);

// View certificates
router.get('/details/certificates', authenticate, authorize(["paaf", "paafadmin"]), paaFEmpController.viewCertificates);

// Approve certificates
router.patch('/approve/certificate', authenticate, authorize(["paaf", "paafadmin"]), paaFEmpController.approveCertificates);

// add new cattleowner
router.post('/add/cattleOwner', authenticate, authorize(["paafadmin"]), paaFEmpController.addCattleowner);

// update cattleowner
router.patch('/update/cattleOwner', authenticate, authorize(["paafadmin"]), paaFEmpController.updateCattleowner);

// delete cattleowner
router.delete('/delete/cattleOwner', authenticate, authorize(["paafadmin"]), paaFEmpController.deleteCattleowner);


// // Download statistics PDF (cattle condensation)
// router.get('/downloadStatistics/:zoneId', authMiddleware('PAAFEmp'), paaFEmpController.downloadStatisticsPDF);


module.exports = router;
