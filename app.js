// app.js
const express = require('express');
const bodyParser = require('body-parser');

const IdentityController = require('./controllers/identifyControllers') ;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.post('/identify', IdentityController.identify);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
