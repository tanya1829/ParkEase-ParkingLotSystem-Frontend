import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RazorpayPaymentComponent from '../components/RazorpayPaymentComponent';

/**
 * BookingConfirmation Page - Production Ready
 * Handles payment for parking bookings
 * Gets all data from JWT token and route parameters
 */
const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user data from JWT token
  const getUserFromToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: parseInt(payload.userId),
        email: payload.email,
        fullName: payload.fullName,
      };
    } catch (err) {
      console.error('Error parsing token:', err);
      return null;
    }
  };

  // Fetch booking data from backend
  const fetchBookingData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:5005/api/v1/bookings/${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch booking: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (err) {
      console.error('Error fetching booking:', err);
      throw err;
    }
  };

  // Initialize component - fetch booking and user data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = getUserFromToken();
        if (!user) {
          throw new Error('User authentication failed');
        }

        // Fetch booking details from backend
        const booking = await fetchBookingData();

        // Prepare complete booking data
        const completeBookingData = {
          bookingId: parseInt(bookingId),
          userId: user.userId,
          spotId: booking.spotId || booking.spot?.id,
          spotNumber: booking.spotNumber || booking.spot?.spotNumber || 'Unknown',
          amount: parseFloat(booking.totalAmount || booking.amount || 0),
          duration: booking.duration || booking.durationHours || 2,
          startTime: booking.startTime || new Date().toISOString(),
          endTime: booking.endTime,
          description: `Parking fee - Spot ${booking.spotNumber || 'Unknown'} (${booking.durationHours || 2} hours)`,
        };

        setBookingData(completeBookingData);
        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to load booking details');
        setLoading(false);
      }
    };

    if (bookingId) {
      initializeData();
    }
  }, [bookingId]);

  const handlePaymentSuccess = async (paymentDetails) => {
    console.log('✅ Payment succeeded:', paymentDetails);
    setPaymentStatus({
      success: true,
      transactionId: paymentDetails.transactionId,
      amount: paymentDetails.amount,
      paymentId: paymentDetails.paymentId,
    });
    setPaymentError(null);

    try {
      // Update booking status to PAID
      const token = localStorage.getItem('authToken');
      await fetch(`http://localhost:5005/api/v1/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CONFIRMED',
          paymentId: paymentDetails.paymentId,
        }),
      });

      // Redirect to booking details or dashboard after 2 seconds
      setTimeout(() => {
        navigate(`/driver/bookings/${bookingId}`);
      }, 2000);
    } catch (err) {
      console.error('Error updating booking:', err);
    }
  };

  const handlePaymentError = (errorMessage) => {
    console.error('❌ Payment failed:', errorMessage);
    setPaymentStatus(null);
    setPaymentError(errorMessage);
  };

  if (loading) {
    return (
      <div className="confirmation-container">
        <div className="confirmation-content">
          <p style={{ color: '#cbd5e1', textAlign: 'center' }}>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="confirmation-container">
        <div className="confirmation-content">
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
            <h2>Error</h2>
            <p>{error}</p>
            <button
              onClick={() => navigate('/driver/bookings')}
              style={{
                padding: '10px 20px',
                background: '#06b6d4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="confirmation-container">
        <div className="confirmation-content">
          <p style={{ color: '#cbd5e1', textAlign: 'center' }}>No booking data found</p>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem('authToken');

  return (
    <div className="confirmation-container">
      <div className="confirmation-content">
        <h1>Booking Confirmation</h1>

        {/* Booking Details */}
        <div className="booking-details">
          <h2>Your Booking Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Parking Spot</label>
              <value>{bookingData.spotNumber}</value>
            </div>
            <div className="detail-item">
              <label>Duration</label>
              <value>{bookingData.duration} Hours</value>
            </div>
            <div className="detail-item">
              <label>Start Time</label>
              <value>{new Date(bookingData.startTime).toLocaleTimeString()}</value>
            </div>
            <div className="detail-item">
              <label>Amount Due</label>
              <value className="amount">₹{bookingData.amount.toFixed(2)}</value>
            </div>
          </div>
        </div>

        {/* Payment Component */}
        <div className="payment-section">
          <RazorpayPaymentComponent
            bookingId={bookingData.bookingId}
            userId={bookingData.userId}
            spotId={bookingData.spotId}
            amount={bookingData.amount}
            description={bookingData.description}
            token={token}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </div>

        {/* Payment Status Messages */}
        {paymentStatus && (
          <div className="payment-success-message">
            <h3>✓ Payment Successful!</h3>
            <p>Transaction ID: {paymentStatus.transactionId}</p>
            <p>Redirecting to booking details...</p>
          </div>
        )}

        {paymentError && (
          <div className="payment-error-message">
            <h3>✗ Payment Failed</h3>
            <p>{paymentError}</p>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="terms">
          <input type="checkbox" id="terms" />
          <label htmlFor="terms">
            I agree to the parking terms and conditions
          </label>
        </div>
      </div>

      <style>{`
        .confirmation-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%);
          padding: 40px 20px;
          font-family: 'Syne', sans-serif;
        }

        .confirmation-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .confirmation-content h1 {
          color: #f1f5f9;
          font-size: 32px;
          margin: 0 0 40px 0;
          text-align: center;
        }

        .booking-details {
          background: rgba(6, 182, 212, 0.05);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 12px;
          padding: 28px;
          margin-bottom: 32px;
        }

        .booking-details h2 {
          color: #cbd5e1;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 20px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detail-item label {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-item value {
          color: #f1f5f9;
          font-size: 15px;
          font-weight: 600;
        }

        .detail-item .amount {
          color: #06b6d4;
          font-size: 18px;
          font-weight: 700;
        }

        .payment-section {
          margin-bottom: 32px;
        }

        .payment-success-message {
          background: rgba(16, 185, 129, 0.1);
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: center;
          color: #10b981;
        }

        .payment-error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: center;
          color: #ef4444;
        }

        .terms {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
        }

        .terms input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #06b6d4;
        }

        .terms label {
          color: #cbd5e1;
          font-size: 14px;
          cursor: pointer;
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default BookingConfirmation;