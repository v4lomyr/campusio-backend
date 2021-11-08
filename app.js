const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv/config');

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Import Routes
const imageMentorRoute = require('./Routes/MentorImage');

// Routes
app.use('/mentorimage', imageMentorRoute);

// listening
app.listen(8080);

// Connect to DB
mongoose.connect(process.env.DB_CONNECTION, () =>
  console.log('connected to DB!')
);
