require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cattleOwnerRoutes = require('./routes/cattleOwnerRoutes');
const veterinarianRoutes = require('./routes/veterinarianRoutes');
const paaFEmpRoutes = require('./routes/paaFEmpRoutes');
const slaughterhouseEmpRoutes = require('./routes/slaughterhouseEmpRoutes');
const db = require('./models');

const app = express();

// Middlewares
app.use(bodyParser.json());

// Routes
app.use('/api/cattleOwners', cattleOwnerRoutes);
app.use('/api/veterinarians', veterinarianRoutes);
app.use('/api/paafemp', paaFEmpRoutes);
app.use('/api/slaughterhouse', slaughterhouseEmpRoutes);

// 404 Error handler (for undefined routes)
app.use((req, res, next) => {
  res.status(404).send('Route not found');
});

// Generic Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;  

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

// db.sequelize.sync().then((req) => {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// })


// db.sequelize.sync({ force: true }).then(async () => {
//   await db.Users.sync();  
//   await db.CattleOwner.sync();       
//   await db.Veterinarian.sync();    
//   await db.SlaughterhouseEmp.sync();  
//   await db.PAAFEmp.sync();  
//   await db.Farms.sync(); 
//   await db.Livestock.sync(); 
//   await db.Appointments.sync(); 
//   await db.Invoices.sync(); 
//   await db.Certificates.sync();

//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }).catch((err) => {
//   console.error("Error syncing models: ", err);
// });