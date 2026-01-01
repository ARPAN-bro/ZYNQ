// backend/src/config/cashfree.js
const axios = require('axios');

const CASHFREE_BASE_URL = process.env.CASHFREE_ENV === 'PRODUCTION' 
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

class CashfreeService {
  constructor() {
    this.appId = process.env.CASHFREE_APP_ID;
    this.secretKey = process.env.CASHFREE_SECRET_KEY;
    this.baseUrl = CASHFREE_BASE_URL;
  }

  async createOrder(orderId, amount, customerDetails) {
    try {
      const orderData = {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerDetails.customerId,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone || '9999999999'
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL}/payment/callback?order_id={order_id}`
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/orders`,
        orderData,
        {
          headers: {
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
            'x-api-version': '2022-09-01',
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Cashfree Create Order Error:', error.response?.data || error.message);
      throw new Error('Failed to create payment order');
    }
  }

  async verifyPayment(orderId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/orders/${orderId}`,
        {
          headers: {
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
            'x-api-version': '2022-09-01'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Cashfree Verify Payment Error:', error.response?.data || error.message);
      throw new Error('Failed to verify payment');
    }
  }

  async getPaymentDetails(orderId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/orders/${orderId}/payments`,
        {
          headers: {
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
            'x-api-version': '2022-09-01'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Cashfree Get Payment Details Error:', error.response?.data || error.message);
      throw new Error('Failed to get payment details');
    }
  }
}

module.exports = new CashfreeService();