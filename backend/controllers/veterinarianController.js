const { Veterinarian, Users, Appointments, Livestock, Farms, CattleOwner, Invoices, Certificates} = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register endpoint for veterinarian
exports.registerVeterinarian = async (req, res) => {
  const { username, password, role, name, employmentId, isadmin, operationLocation, employmentStatus } = req.body;

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

    const newVeterinarian = await Veterinarian.create({
      userId: newUser.id,
      name,
      employmentId,
      isadmin,
      operationLocation,
      employmentStatus,
    });

    res.status(201).json({
      message: 'Veterinarian registered successfully',
      veterinarian: newVeterinarian,
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Log in a Veterinarian
exports.loginVeterinarian = async (req, res) => {
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

    const veterinarian = await Veterinarian.findOne({ where: { userId: user.id } });

    if (!veterinarian) {
      return res.status(404).json({ error: 'Veterinarian details not found' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, veterinarianId: veterinarian.id },
      process.env.JWT_SECRET,  
      { expiresIn: '1h' }  // Token expires in 1 hour
    );

    res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAppointments = async (req, res) => {

  try {
    const userId = req.user.id;
    const veterinarian = await Veterinarian.findOne({ where: { userId: userId } });
    

    // Fetch all appointments assigned to this veterinarian
    const appointments = await Appointments.findAll({
      where: { veterinarianId: veterinarian.id },
      include: [
        {
          model: Livestock,
          as: 'livestock',
          attributes: ['id', 'rfidTagSerialNumber', 'cattleType'], // Adjust as needed
        },
        {
          model: Farms,
          as: 'farm',
          attributes: ['id', 'name', 'location'], // Adjust as needed
        },
        {
          model: CattleOwner,
          as: 'cattleOwner',
          attributes: ['id', 'name'], // Adjust as needed
        },
      ],
    });

    if (appointments.length === 0) {
      return res.status(404).json({ error: "No appointments found for this veterinarian." });
    }

    // Return the list of appointments
    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments for veterinarian:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Get All Livestock details
exports.getAllLiveStock = async (req, res) => {

  try {
    const livestock = await Livestock.findAll();

    // If no livestock found, return a message
    if (!livestock || livestock.length === 0) {
      return res.status(200).json({ message: "No livestock found." });
    }

    // Return the livestock details
    return res.status(200).json({ message: "Livestock details retrieved successfully.", livestock });
  } catch (error) {
    console.error("Error retrieving livestock for veterinarian:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Get All Farm details
exports.getAllFarms = async (req, res) => {

  try {
    const farms = await Farms.findAll();

    // If no farms found, return a message
    if (!farms || farms.length === 0) {
      return res.status(200).json({ message: "No farms found." });
    }

    // Return the farms details
    return res.status(200).json({ message: "Farms details retrieved successfully.", farms });
  } catch (error) {
    console.error("Error retrieving farms for veterinarian:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Get All Cattle owner details
exports.getAllCattleOwners = async (req, res) => {

  try {
    const cattleOwner = await CattleOwner.findAll();

    // If no cattleOwner found, return a message
    if (!cattleOwner || cattleOwner.length === 0) {
      return res.status(200).json({ message: "No cattleOwner found." });
    }

    // Return the cattleOwner details
    return res.status(200).json({ message: "cattleOwner details retrieved successfully.", cattleOwner });
  } catch (error) {
    console.error("Error retrieving farms for veterinarian:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Add new livestock
exports.addLivestock = async (req, res) => {
  const { rfidTagSerialNumber, cattleType, cattleOwnerId, farmId } = req.body;

  try {
    // Validate required fields
    if (!rfidTagSerialNumber || !cattleType || !cattleOwnerId || !farmId) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // Validate cattle type
    const validCattleTypes = ["cow", "goat", "sheep", "camel", "horse"];
    if (!validCattleTypes.includes(cattleType)) {
      return res.status(400).json({ error: "Invalid cattle type." });
    }

    // Validate cattle owner
    const cattleOwner = await CattleOwner.findOne({ where: { id: cattleOwnerId } });
    if (!cattleOwner) {
      return res.status(404).json({ error: "Cattle owner not found." });
    }

    // Validate farm
    const farm = await Farms.findOne({ where: { id: farmId } });
    if (!farm) {
      return res.status(404).json({ error: "Farm not found." });
    }

    // Create new livestock record
    const livestock = await Livestock.create({
      rfidTagSerialNumber,
      cattleType,
      cattleOwnerId,
      farmId,
      addedDate: new Date(), // Automatically set the addedDate
      updatedDate: new Date(), // Automatically set the updatedDate
    });

    return res.status(201).json({
      message: "New livestock added successfully.",
      livestock,
    });

  } catch (error) {
    console.error("Error adding livestock:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// add veterinarian (only for vet admins) - assumes usernames and passwords are also set by the vet admin
exports.addVeterinarian = async (req, res) => {
  const { username, password, name, employmentId, isadmin, operationLocation, employmentStatus, role } = req.body;

  try {
    // Validate required fields
    if (!username || !password || !name || !employmentId || !operationLocation || !employmentStatus || !role) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user first
    const user = await Users.create({
      username,
      password: hashedPassword, 
      role
    });

    // Create the veterinarian record and associate it with the user
    const veterinarian = await Veterinarian.create({
      userId: user.id, 
      name,
      employmentId,
      isadmin,
      operationLocation,
      employmentStatus,
    });

    return res.status(201).json({
      message: "Veterinarian added successfully.",
      veterinarian
    });
  } catch (error) {
    console.error("Error adding veterinarian:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// get all veterinarians (only for admins)
exports.getAllVeterinarians = async (req, res) => {
  try {
    // Retrieve all veterinarians
    const veterinarians = await Veterinarian.findAll({
      include: [{
        model: Users,
        as: 'user',
        attributes: ['username', 'role'], 
      }],
    });

    // If no veterinarians are found
    if (!veterinarians || veterinarians.length === 0) {
      return res.status(404).json({ error: "No veterinarians found." });
    }

    // Return all veterinarian records
    return res.status(200).json({ veterinarians });
  } catch (error) {
    console.error("Error fetching veterinarians:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Edit Veterinarian Record (only for admins)
exports.editVeterinarian = async (req, res) => {
  const { id, name, employmentId, isadmin, operationLocation, employmentStatus } = req.body;

  try {
    // Validate required fields (you can customize this based on the fields you want to ensure are present)
    if (!name || !employmentId || !operationLocation || !employmentStatus || !id) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // Find the veterinarian by ID
    const veterinarian = await Veterinarian.findOne({ where: { id: id } });

    // If veterinarian not found, return 404 error
    if (!veterinarian) {
      return res.status(404).json({ error: "Veterinarian not found." });
    }

    // Update veterinarian record with the provided data
    const updatedVeterinarian = await veterinarian.update({
      name,
      employmentId,
      isadmin,
      operationLocation,
      employmentStatus,
    });

    // Return the updated veterinarian details
    return res.status(200).json({ message: "Veterinarian updated successfully.", updatedVeterinarian });
  } catch (error) {
    console.error("Error updating veterinarian:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Get number of veterinarians needed for a location
exports.getVeterinarianNeed = async (req, res) => {
  const { location } = req.body;  

  try {
    // Fetch the farm by location
    const farm = await Farms.findOne({ where: { location } });

    if (!farm) {
      return res.status(404).json({ error: "Farm not found for this location." });
    }

    // Count the number of livestock at the farm
    const livestockCount = await Livestock.count({ where: { farmId: farm.id } });

    // Count the number of cattle owners at the farm location
    const cattleOwnerCount = await CattleOwner.count({
      where: { operationLocation: location }
    });

    // Calculate number of veterinarians needed (1 veterinarian for every 5 livestock)
    const veterinariansNeeded = Math.ceil(livestockCount / 5);

    // Return the information
    return res.status(200).json({
      farmLocation: location,
      livestockCount,
      cattleOwnerCount,
      veterinariansNeeded
    });
  } catch (error) {
    console.error("Error fetching veterinarian need:", error);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// complete appointment
exports.completeAppointment = async (req, res) => {

  const { appointmentId, completionDate, amount } = req.body;

    try {
        // Step 1: Find the appointment by ID and check if it's valid
        const appointment = await Appointments.findOne({
            where: { id: appointmentId },
            include: [
                { model: CattleOwner, as: 'cattleOwner' },
                { model: Livestock, as: 'livestock' },
                { model: Veterinarian, as: 'veterinarian' }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Step 2: Update appointment status to "completed"
        appointment.status = 'completed';
        appointment.completionDate = completionDate;
        await appointment.save();

        // Step 3: Generate an Invoice
        const invoice = await Invoices.create({
            amount: amount, 
            status: 'pending',
            cattleOwnerId: appointment.cattleOwnerId,
            veterinarianId: appointment.veterinarianId,
            appointmentId: appointment.id,
            farmId: appointment.farmId,
            livestockId: appointment.livestockId,
            paidDate: null, // Set to null initially
            sentToOwner: true // Can be updated based on additional logic, marked true since owner can see invoices
        });

        // Step 4: Generate a Certificate
        const certificate = await Certificates.create({
            certificateStatus: 'Pending',
            cattleOwnerId: appointment.cattleOwnerId,
            veterinarianId: appointment.veterinarianId,
            appointmentId: appointment.id,
            livestockId: appointment.livestockId,
            details: 'Certificate generated after completed appointment', // Add relevant details
            sentToPAAF: true, // Can be updated based on further logic, marked true since paaf can see certificates
            paafEmpId: null // Assuming an empId will be assigned later if needed
        });

        // Step 5: Send the response
        return res.status(200).json({
            message: 'Appointment completed successfully',
            appointment: appointment,
            invoice: invoice,
            certificate: certificate
        });

    } catch (error) {
        console.error('Error updating appointment:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }

};