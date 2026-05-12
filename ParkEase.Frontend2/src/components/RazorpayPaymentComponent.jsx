import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PAYMENT_API = 'http://localhost:5006/api/v1/payments';

/**
 * RazorpayPaymentComponent
 * Real Razorpay integration with test mode support
 * Test cards: 4111111111111111 (Visa), 5555555555554444 (Mastercard)
 * Any future date as expiry, any 3 digits as CVV
 */
const RazorpayPaymentComponent = ({
  bookingId,
  userId,
  amount,
  spotId,
  description = 'Parking fee',
  onPaymentSuccess,
  onPaymentError,
  token,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Load Razorpay script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      setError('Failed to load payment gateway. Please try again.');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  /**
   * Step 1: Create Razorpay Order via backend
   */
  const createOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${PAYMENT_API}/create-order`,
        {
          bookingId,
          userId,
          spotId,
          amount,
          description,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create order');
      }

      console.log('✅ Order created:', response.data.data);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error creating order';
      setError(errorMsg);
      onPaymentError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Open Razorpay Checkout Modal
   */
  const openRazorpayModal = (orderData) => {
    if (!window.Razorpay) {
      setError('Payment gateway not loaded. Please refresh and try again.');
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: Math.round(orderData.amount * 100), // Convert to paise
      currency: 'INR',
      order_id: orderData.orderId,
      name: 'ParkEase',
      description: orderData.description,
      prefill: {
        name: 'Driver',
        email: 'driver@parkease.com',
        contact: '9876543210',
      },
      theme: {
        color: '#06b6d4',
      },
      handler: (response) => {
        handlePaymentSuccess(response, orderData);
      },
      modal: {
        ondismiss: () => {
          setError('Payment cancelled by user');
          onPaymentError('Payment cancelled');
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError('Failed to open payment modal. Please try again.');
      onPaymentError('Failed to open modal');
    }
  };

  /**
   * Step 3: Verify Payment Signature with Backend
   */
  const verifyPayment = async (paymentResponse, orderData) => {
    try {
      setLoading(true);

      const verifyPayload = {
        bookingId,
        userId,
        amount,
        mode: 'CARD',
        razorpayOrderId: orderData.orderId,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      };

      const response = await axios.post(
        `${PAYMENT_API}/verify`,
        verifyPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Payment verification failed');
      }

      console.log('✅ Payment verified:', response.data.data);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Verification failed';
      setError(errorMsg);
      onPaymentError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle successful payment from Razorpay
   */
  const handlePaymentSuccess = async (paymentResponse, orderData) => {
    try {
      setLoading(true);

      // Verify the payment with backend
      const verifiedPayment = await verifyPayment(paymentResponse, orderData);

      // Store payment details
      setPaymentDetails(verifiedPayment);
      setSuccess(true);
      setError(null);

      // Call success callback
      onPaymentSuccess(verifiedPayment);

      console.log('✅ Payment successful and verified');
    } catch (err) {
      console.error('❌ Payment verification failed:', err);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Main handler: Create order → Open modal → Verify payment
   */
  const handlePaymentClick = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Step 1: Create order
      const orderData = await createOrder();

      // Step 2: Open Razorpay modal (this is async but handled via callback)
      openRazorpayModal(orderData);
    } catch (err) {
      console.error('❌ Payment process failed:', err);
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      {/* Success State */}
      {success && paymentDetails && (
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <h3>Payment Successful!</h3>
          <p>Transaction ID: {paymentDetails.transactionId}</p>
          <p>Amount: ₹{paymentDetails.amount}</p>
          <p className="success-time">
            {new Date(paymentDetails.paidAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !success && (
        <div className="payment-error">
          <div className="error-icon">!</div>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={handlePaymentClick}
            disabled={loading}
          >
            Retry Payment
          </button>
        </div>
      )}

      {/* Default State */}
      {!success && (
        <div className="payment-card">
          <div className="payment-header">
            <h2>Complete Payment</h2>
            <span className="payment-badge">Secure</span>
          </div>

          <div className="payment-details">
            <div className="detail-row">
              <span className="detail-label">Booking ID</span>
              <span className="detail-value">#{bookingId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Amount</span>
              <span className="detail-value-large">₹{amount.toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Description</span>
              <span className="detail-value">{description}</span>
            </div>
          </div>

          <button
            className={`pay-button ${loading ? 'loading' : ''}`}
            onClick={handlePaymentClick}
            disabled={loading || !bookingId || !userId || amount <= 0}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <span className="lock-icon">🔒</span>
                Pay ₹{amount.toFixed(2)} via Razorpay
              </>
            )}
          </button>

          <p className="payment-note">
            Powered by Razorpay • Your payment is secured with 256-bit encryption
          </p>

          <p className="test-card-info">
            🧪 Test Mode: Use card 4111 1111 1111 1111, any future date & CVV
          </p>
        </div>
      )}

      <style>{`
        .payment-container {
          max-width: 500px;
          margin: 0 auto;
          font-family: 'Syne', sans-serif;
        }

        /* Card Styles */
        .payment-card {
          background: linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .payment-header h2 {
          color: #f1f5f9;
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .payment-badge {
          background: rgba(6, 182, 212, 0.15);
          color: #06b6d4;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Payment Details */
        .payment-details {
          background: rgba(6, 182, 212, 0.05);
          border-left: 3px solid #06b6d4;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 28px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 500;
        }

        .detail-value-large {
          color: #06b6d4;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -1px;
        }

        /* Pay Button */
        .pay-button {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-bottom: 16px;
        }

        .pay-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(6, 182, 212, 0.3);
        }

        .pay-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .pay-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pay-button.loading {
          background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
        }

        .lock-icon {
          font-size: 16px;
        }

        /* Spinner Animation */
        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .payment-note {
          text-align: center;
          color: #64748b;
          font-size: 12px;
          margin: 0;
          line-height: 1.5;
          letter-spacing: 0.3px;
        }

        .test-card-info {
          text-align: center;
          color: #0891b2;
          font-size: 11px;
          margin: 8px 0 0 0;
          padding: 8px;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 6px;
        }

        /* Success State */
        .payment-success {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 16px;
          padding: 40px 32px;
          text-align: center;
          animation: successPulse 0.6s ease-out;
        }

        @keyframes successPulse {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .success-icon {
          font-size: 48px;
          color: #10b981;
          margin-bottom: 16px;
          animation: checkmark 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes checkmark {
          0% {
            transform: scale(0) rotate(-45deg);
          }
          100% {
            transform: scale(1) rotate(0);
          }
        }

        .payment-success h3 {
          color: #10b981;
          font-size: 22px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .payment-success p {
          color: #cbd5e1;
          font-size: 14px;
          margin: 8px 0;
        }

        .success-time {
          color: #94a3b8;
          font-size: 12px !important;
          margin-top: 16px;
        }

        /* Error State */
        .payment-error {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          animation: shake 0.5s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .error-icon {
          font-size: 48px;
          color: #ef4444;
          margin-bottom: 16px;
        }

        .payment-error p {
          color: #fca5a5;
          font-size: 14px;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        .retry-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(239, 68, 68, 0.2);
        }

        .retry-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default RazorpayPaymentComponent;