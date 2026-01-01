// backend/src/controllers/donationController.js
const Donation = require('../models/Donation');
const User = require('../models/User');
const cashfreeService = require('../config/cashfree');

exports.createDonation = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid donation amount' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${userId}`;

    // Create donation record
    const donation = new Donation({
      userId,
      amount,
      orderId,
      status: 'pending'
    });
    await donation.save();

    // Create Cashfree order
    const cashfreeOrder = await cashfreeService.createOrder(
      orderId,
      amount,
      {
        customerId: userId.toString(),
        email: user.email,
        phone: user.phone || '9999999999'
      }
    );

    res.json({
      orderId,
      paymentSessionId: cashfreeOrder.payment_session_id,
      orderAmount: amount
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
};

exports.verifyDonation = async (req, res) => {
  try {
    const { orderId } = req.body;

    const donation = await Donation.findOne({ orderId });
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Verify with Cashfree
    const paymentDetails = await cashfreeService.verifyPayment(orderId);

    if (paymentDetails.order_status === 'PAID') {
      donation.status = 'success';
      donation.completedAt = new Date();
      donation.paymentId = paymentDetails.cf_order_id;
      donation.metadata = paymentDetails;
      await donation.save();

      // Update user's donation history
      const user = await User.findById(donation.userId);
      user.donations.push({
        amount: donation.amount,
        orderId: donation.orderId,
        date: donation.completedAt
      });
      user.totalDonated += donation.amount;
      
      // Mark as premium if donated
      if (user.totalDonated >= 99) {
        user.isPremium = true;
      }
      
      await user.save();

      res.json({
        success: true,
        message: 'Thank you for your donation!',
        donation
      });
    } else {
      donation.status = 'failed';
      await donation.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        status: paymentDetails.order_status
      });
    }
  } catch (error) {
    console.error('Verify donation error:', error);
    res.status(500).json({ error: 'Failed to verify donation' });
  }
};

exports.getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({ donations });
  } catch (error) {
    console.error('Get donation history error:', error);
    res.status(500).json({ error: 'Failed to fetch donation history' });
  }
};