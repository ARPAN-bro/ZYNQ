// backend/src/routes/donations.js
const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const auth = require('../middleware/auth');

router.post('/create', auth, donationController.createDonation);
router.post('/verify', auth, donationController.verifyDonation);
router.get('/history', auth, donationController.getDonationHistory);

module.exports = router;