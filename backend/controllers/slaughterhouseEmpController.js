const { SlaughterhouseEmp, Livestock, Users } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');

// Register a new Slaughterhouse Employee
exports.registerSlaughterhouseEmp = async (req, res) => {
  const { name, employmentId, isadmin, operationLocation, username, password, role } = req.body;

  try {
    const existingUser = await Users.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists. Please choose another one." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Users.create({
      username,
      password: hashedPassword,
      role,
    });

    const newSlaughterhouseEmp = await SlaughterhouseEmp.create({
      userId: newUser.id,
      name,
      employmentId,
      isadmin,
      operationLocation,
    });

    res.status(201).json({
      message: 'Slaughterhouse Employee registered successfully',
      slaughterhouseEmp: newSlaughterhouseEmp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Log in Slaughterhouse employee
exports.loginSlaughterhouseEmp = async (req, res) => {
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
      process.env.JWT_SECRET, 
      { expiresIn: '1h' } 
    );

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.markAsDeceased = async (req, res) => {
  const { rfidTagSerialNumber } = req.body; // RFID tag serial number of the livestock to update

  try {
    // Step 1: Find the Livestock using the RFID tag
    const livestock = await Livestock.findOne({
      where: { rfidTagSerialNumber },
    });

    if (!livestock) {
      return res.status(404).json({ message: 'Livestock not found' });
    }

    // Step 2: Update the status of the livestock to 'deceased'
    livestock.status = 'deceased';

    // Step 3: Save the updated livestock record
    await livestock.save();

    res.status(200).json({
      message: 'Livestock status updated to deceased',
      livestock,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error updating livestock status',
      error: error.message,
    });
  }
};

// // Generate a post-mortem report (PDF)
// exports.generatePostMortemReport = async (req, res) => {
//   const { livestockId } = req.params;

//   try {
//     const livestock = await Livestock.findByPk(livestockId);

//     if (!livestock || livestock.status !== 'deceased') {
//       return res.status(404).json({ message: 'No deceased livestock found for the given ID' });
//     }

//     const doc = new PDFDocument();
//     const filename = `Post_Mortem_Report_${livestockId}.pdf`;

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

//     doc.pipe(res);

//     // Generate report content
//     doc.fontSize(16).text(`Post-Mortem Report for Livestock ${livestockId}`, { align: 'center' });
//     doc.moveDown();

//     // Add the post-mortem report details (assuming it's available)
//     doc.text(`Livestock ID: ${livestock.id}`);
//     doc.text(`Owner: ${livestock.ownerName}`);
//     doc.text(`Farm: ${livestock.farmName}`);
//     doc.text(`Status: ${livestock.status}`);
//     doc.moveDown();

//     // Check if livestock is deemed noxious
//     if (livestock.isNoxious) {
//       doc.text('This livestock is deemed noxious.');
//       // Logic for compensating the cattle owner
//       await compensateCattleOwner(livestock.ownerId);
//     } else {
//       doc.text('This livestock is not deemed noxious.');
//     }

//     doc.end();
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Compensation handling if livestock is deemed noxious
// const compensateCattleOwner = async (ownerId) => {
//   try {
//     const cattleOwner = await CattleOwner.findByPk(ownerId);

//     if (cattleOwner) {
//       // Logic to send compensation to cattle owner (e.g., updating their account, notifying via app)
//       console.log(`Compensation sent to Cattle Owner ${cattleOwner.name}`);
//     }
//   } catch (error) {
//     console.error('Error compensating cattle owner:', error);
//   }
// };
