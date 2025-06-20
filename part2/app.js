const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const db = require('./models/db');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
  secret: 'superSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, path: '/' }

}));

app.use((req, res, next) => {
  req.db = db;
  next();
});


// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const apiRouter = require('./routes/api');


app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use('/api', apiRouter);


// Export the app instead of listening here
module.exports = app;