const express = require('express');
const resolveConflicts = require('../controllers/identifyControllers');
const router = express.Router();

router.post('/identify', async (req, res) => {
  try {
    const newContact = req.body;
    const response = await resolveConflicts(newContact);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
