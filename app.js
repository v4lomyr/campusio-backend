const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');
const passport = require('passport');
const session = require('express-session');
require('dotenv/config');

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(timeout(120000));
app.use(haltOnTimedout);
app.use(session({ secret: 'Campusio' }));
app.use(passport.initialize());
app.use(passport.session());

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

// Import Routes
const imageMentorRoute = require('./Routes/MentorImage');
const authenticationRoute = require('./Routes/Authentication');
const authenticatedUserRoute = require('./Routes/AuthenticatedUser');

// Routes
app.use('/mentorimage', imageMentorRoute);
app.use('/auth', authenticationRoute);
app.use('/authenticated', authenticatedUserRoute);

// listening
app.listen(process.env.PORT || 8080);

// Connect to DB
mongoose.connect(process.env.DB_CONNECTION, () =>
  console.log('connected to DB!')
);
