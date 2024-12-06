const { PAAFEmp, CattleOwner, Users, Certificates, Veterinarian, Livestock } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');

// Register a new PAAF Employee
exports.registerPAAFEmp = async (req, res) => {

  const {
    name,
    employmentId,
    isadmin,
    operationLocation,
    username,
    password,
    role
  } = req.body;

  try {
    // Check if a user with the same username exists
    const existingUser = await Users.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists. Please choose another one." });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the Users table
    const newUser = await Users.create({
      username,
      password: hashedPassword,
      role,
    });

    // Create a new PAAF Employee record
    const newPAAFEmp = await PAAFEmp.create({
      userId: newUser.id,
      name,
      employmentId,
      isadmin,
      operationLocation,
    });

    res.status(201).json({
      message: "PAAF Employee registered successfully",
      paafEmp: newPAAFEmp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Log in a PAAF employee
exports.loginPAAFEmp = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Users.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET, // Secret key
      { expiresIn: '1h' } // Expiration time (1 hour)
    );

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// View and search cattle owner records
exports.viewCattleOwnerRecords = async (req, res) => {
  try {
    // Fetch all cattle owners
    const cattleOwners = await CattleOwner.findAll();

    // Return the cattle owner data
    res.status(200).json({ cattleOwners });
  } catch (error) {
    console.error('Error fetching cattle owners:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// View and search cattle owner records
exports.viewCertificates = async (req, res) => {
  try {
    // Find certificates associated with the given PAAFEmp ID
    const certificates = await Certificates.findAll({
      include: [
        { model: CattleOwner, as: 'cattleOwner', attributes: ['id', 'name'] },
        { model: Veterinarian, as: 'veterinarian', attributes: ['id', 'name'] },
        { model: Livestock, as: 'livestock', attributes: ['id', 'rfidTagSerialNumber', 'cattleType'] },
      ],
    });

    if (!certificates.length) {
      return res.status(404).json({ message: 'No certificates found!' });
    }

    // Return the certificates data
    res.status(200).json({ certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// approve certificates
exports.approveCertificates = async (req, res) => {
  const { certificateId } = req.body;

  try {

    // Get the user ID from the authenticated user
    const userId = req.user.id;
    const paafEmp = await PAAFEmp.findOne({ where: { userId: userId } });

    // Find the certificate to approve
    const certificate = await Certificates.findOne({
      where: { id: certificateId },
    });

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Update the certificate status to 'Approved'
    certificate.certificateStatus = 'Approved';
    certificate.paafEmpId = paafEmp.id;
    await certificate.save();

    res.status(200).json({
      message: 'Certificate successfully approved',
      certificate,
    });
  } catch (error) {
    console.error('Error approving certificate:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// add new cattle owner (only for admins)
exports.addCattleowner = async (req, res) => {
  const { username, password, role, name, employmentId, isadmin, operationLocation, phoneNumber, civilIdentification, cattleType, shepherdingLevel, cattleQuantity } = req.body;

  try {
    // Step 1: Create User
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = await Users.create({
      username,
      password: hashedPassword,
      role: role || 'owner', // Default to 'owner' if role is not provided
    });

    // Step 2: Create CattleOwner linked to the User
    const newCattleOwner = await CattleOwner.create({
      userId: newUser.id, // Link to the created User
      name,
      employmentId,
      isadmin,
      operationLocation,
      phoneNumber,
      civilIdentification,
      cattleType,
      shepherdingLevel,
      cattleQuantity,
    });

    res.status(201).json({
      message: 'CattleOwner and User created successfully',
      cattleOwner: newCattleOwner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error creating CattleOwner and User',
      error: error.message,
    });
  }
}

// update cattle owner (only for admins)
exports.updateCattleowner = async (req, res) => {

  const {
    cattleOwnerId,
    name,
    employmentId,
    isadmin,
    operationLocation,
    phoneNumber,
    civilIdentification,
    cattleType,
    shepherdingLevel,
    cattleQuantity,
  } = req.body;

  try {
    // Step 1: Find the CattleOwner to update
    const cattleOwner = await CattleOwner.findByPk(cattleOwnerId);
    if (!cattleOwner) {
      return res.status(404).json({ message: 'CattleOwner not found' });
    }

    // Step 2: Update the CattleOwner fields with the provided data
    if (name) cattleOwner.name = name;
    if (employmentId) cattleOwner.employmentId = employmentId;
    if (isadmin !== undefined) cattleOwner.isadmin = isadmin;
    if (operationLocation) cattleOwner.operationLocation = operationLocation;
    if (phoneNumber) cattleOwner.phoneNumber = phoneNumber;
    if (civilIdentification) cattleOwner.civilIdentification = civilIdentification;
    if (cattleType) cattleOwner.cattleType = cattleType;
    if (shepherdingLevel) cattleOwner.shepherdingLevel = shepherdingLevel;
    if (cattleQuantity !== undefined) cattleOwner.cattleQuantity = cattleQuantity;

    // Step 3: Save the updated CattleOwner record
    await cattleOwner.save();

    res.status(200).json({
      message: 'CattleOwner updated successfully',
      cattleOwner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error updating CattleOwner',
      error: error.message,
    });
  }

}

// delete cattle owner (only for admins)
exports.deleteCattleowner = async (req, res) => {

  const {cattleOwnerId} = req.body; // ID of the CattleOwner to delete

  try {
    // Step 1: Find the CattleOwner to delete
    const cattleOwner = await CattleOwner.findByPk(cattleOwnerId);
    if (!cattleOwner) {
      return res.status(404).json({ message: 'CattleOwner not found' });
    }

    // Step 2: Delete the CattleOwner record
    await cattleOwner.destroy();

    res.status(200).json({
      message: 'CattleOwner deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error deleting CattleOwner',
      error: error.message,
    });
  }

}


// // Download PDF for cattle condensation statistics or heatmaps
// exports.downloadStatisticsPDF = async (req, res) => {
//   const { zoneId } = req.params;

//   try {
//     const doc = new PDFDocument();
//     const filename = `Cattle_Condensation_Statistics_${zoneId}.pdf`;

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

//     doc.pipe(res);

//     doc.fontSize(16).text(`Cattle Condensation Statistics for Zone ${zoneId}`, { align: 'center' });
//     doc.moveDown();

//     // Here you can add more details to the PDF, such as data about the zone, cattle, heatmaps, etc.

//     doc.end();
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Administrative functions for CRUD operations on cattle owner records (for admins only)
// exports.crudCattleOwnerRecords = async (req, res) => {
//   const { action, cattleOwnerId, data } = req.body;

//   try {
//     switch (action) {
//       case 'create':
//         const newCattleOwner = await CattleOwner.create(data);
//         res.status(201).json({ message: 'Cattle Owner created', cattleOwner: newCattleOwner });
//         break;
//       case 'update':
//         const updatedCattleOwner = await CattleOwner.update(data, { where: { id: cattleOwnerId } });
//         res.json({ message: 'Cattle Owner updated', cattleOwner: updatedCattleOwner });
//         break;
//       case 'delete':
//         await CattleOwner.destroy({ where: { id: cattleOwnerId } });
//         res.json({ message: 'Cattle Owner deleted' });
//         break;
//       default:
//         res.status(400).json({ message: 'Invalid action' });
//         break;
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
