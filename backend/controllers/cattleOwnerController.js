const { CattleOwner, Appointments, Users, Farms, Livestock, Veterinarian, Invoices, Certificates, PAAFEmp } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment'); // For date validation

// Register a new CattleOwner
exports.registerCattleOwner = async (req, res) => {

  const { name, employmentId, isadmin, operationLocation,
    phoneNumber, civilIdentification, cattleType, shepherdingLevel,
    cattleQuantity, username, password, role } = req.body;


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

    const newCattleOwner = await CattleOwner.create({
      userId: newUser.id,
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
      message: 'Cattle Owner registered successfully',
      cattleOwner: newCattleOwner,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login a CattleOwner
exports.loginCattleOwner = async (req, res) => {
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Book an appointment 
exports.bookAppointment = async (req, res) => {
  const { appointmentType, numCattle, scheduledDate, comment, livestockId, farmId, veterinarianId } = req.body;

  try {
    // Validate required fields
    if (!appointmentType || !numCattle || !scheduledDate || !livestockId || !farmId || !veterinarianId) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // Validate appointment type
    const validAppointmentTypes = ["Immunization", "New Births", "Welfare Check"];
    if (!validAppointmentTypes.includes(appointmentType)) {
      return res.status(400).json({ error: "Invalid appointment type." });
    }

    // Validate livestock 
    const userId = req.user.id;
    const user = await Users.findOne({ where: { id: userId } });
    const cattleOwner = await CattleOwner.findOne({ where: { userId: user.id } });
    const cattleOwnerId = cattleOwner.id;
    const livestock = await Livestock.findOne({ where: { id: livestockId } });
    if (!livestock) {
      return res.status(404).json({ error: "Livestock not found." });
    }

    // Validate farm association
    const farm = await Farms.findOne({ where: { id: farmId } });
    if (!farm) {
      return res.status(404).json({ error: "Farm not found." });
    }

    // Validate veterinarian
    const veterinarian = await Veterinarian.findOne({ where: { id: veterinarianId } });
    if (!veterinarian) {
      return res.status(404).json({ error: "Veterinarian not found." });
    }

    // Create appointment
    const appointment = await Appointments.create({
      appointmentType,
      numCattle,
      scheduledDate,
      comment,
      cattleOwnerId,
      farmId,
      veterinarianId,
      livestockId,
      status: "scheduled"

    });

    return res.status(201).json({ message: "Appointment booked successfully.", appointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

exports.getAllFarms = async (req, res) => {
  try {
    const farms = await Farms.findAll(); // Get all farms, no filtering
    if (!farms.length) {
      return res.status(404).json({ message: 'No farms found.' });
    }
    return res.status(200).json(farms);
  } catch (error) {
    console.error('Error fetching farms:', error);
    return res.status(500).json({ message: 'Server error fetching farms.' });
  }
};

exports.getAllVeterinarians = async (req, res) => {
  try {
    const veterinarians = await Veterinarian.findAll(); // Get all veterinarians, no filtering
    if (!veterinarians.length) {
      return res.status(404).json({ message: 'No veterinarians found.' });
    }
    return res.status(200).json(veterinarians);
  } catch (error) {
    console.error('Error fetching veterinarians:', error);
    return res.status(500).json({ message: 'Server error fetching veterinarians.' });
  }
};

exports.getOwnedLiveStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findOne({ where: { id: userId } });
    const cattleOwner = await CattleOwner.findOne({ where: { userId: user.id } });
    const cattleOwnerId = cattleOwner.id;
    const livestock = await Livestock.findAll({
      where: {
        cattleOwnerId: cattleOwnerId  // Filter livestock based on cattleOwnerId
      }
    });

    if (!livestock.length) {
      return res.status(404).json({ message: 'No livestock found for this cattle owner.' });
    }

    return res.status(200).json(livestock);
  } catch (error) {
    console.error('Error fetching livestock:', error);
    return res.status(500).json({ message: 'Server error fetching livestock.' });
  }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res) => {
  const { appointmentId } = req.body;  // Extract the appointmentId from the URL parameter

  try {
    // Validate if the appointment exists
    const appointment = await Appointments.findOne({ where: { id: appointmentId } });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    // Check if the appointment is already cancelled
    if (appointment.status === "cancelled") {
      return res.status(400).json({ error: "This appointment has already been cancelled." });
    }

    // Update the appointment status to "cancelled"
    appointment.status = "cancelled";
    await appointment.save();  // Save the changes to the database

    return res.status(200).json({ message: "Appointment cancelled successfully.", appointment });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};


// Get all appointments for a cattle owner
exports.getAppointments = async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user.id;

    // Find the cattle owner associated with the user
    const cattleOwner = await CattleOwner.findOne({ where: { userId: userId } });

    if (!cattleOwner) {
      return res.status(404).json({ error: "Cattle owner not found." });
    }

    // Get all appointments associated with the cattle owner's ID
    const appointments = await Appointments.findAll({
      where: { cattleOwnerId: cattleOwner.id },
      include: [
        {
          model: Livestock,
          as: 'livestock',
          attributes: ['id', 'rfidTagSerialNumber', 'cattleType'], // Adjust attributes as needed
        },
        {
          model: Farms,
          as: 'farm',
          attributes: ['id', 'name', 'location'], // Adjust attributes as needed
        },
        {
          model: Veterinarian,
          as: 'veterinarian',
          attributes: ['id', 'employmentId', 'name'], // Adjust attributes as needed
        },
      ],
    });

    if (appointments.length === 0) {
      return res.status(404).json({ error: "No appointments found for this cattle owner." });
    }

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// get invoices
exports.getInvoices = async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user.id;

    // Find the cattle owner associated with the user
    const cattleOwner = await CattleOwner.findOne({ where: { userId: userId } });

    // Get invoices related to the cattle owner
    const invoices = await Invoices.findAll({
      where: { cattleOwnerId: cattleOwner.id },
      include: ['appointment', 'veterinarian'], // You can include more relationships as needed
    });

    // Respond with the invoices
    res.status(200).json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// get certificates
exports.getCertificates = async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user.id;

    // Find the cattle owner associated with the user
    const cattleOwner = await CattleOwner.findOne({ where: { userId: userId } });

    const certificates = await Certificates.findAll({
      where: { cattleOwnerId:  cattleOwner.id},
      include: [
        {
          model: Veterinarian,
          as: 'veterinarian',
          attributes: ['id', 'employmentId', 'name', 'operationLocation'],
        },
        {
          model: Livestock,
          as: 'livestock',
          attributes: ['id', 'rfidTagSerialNumber', 'cattleType'],
        },
        {
          model: PAAFEmp,
          as: 'paafEmp',
          attributes: ['id', 'employmentId', 'name', 'operationLocation'],
        },
        {
          model: Appointments,
          as: 'appointment',
          attributes: ['id', 'scheduledDate', 'completionDate', 'status', 'appointmentType'],
        },
      ],
    });

    // If no certificates are found
    if (!certificates || certificates.length === 0) {
      return res.status(404).json({ message: 'No certificates found for this cattle owner' });
    }

    // Respond with the list of certificates
    res.status(200).json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

