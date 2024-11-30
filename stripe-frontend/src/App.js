import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './App.css'; // Import the CSS file for styling

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_live_51H5N3KKO7krI6NOy3Mr4e4ReNFkNL3ZfThzomL94t6c5D0Z8SjQ5jqSkfqvolbQZhooFPg710Vi6nXwCKTteKnRQ00fEoQpAAI');

// CheckoutForm Component
const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentStatus, setPaymentStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const card = elements.getElement(CardElement);

        if (!stripe || !card) return;

        try {
            const { data } = await axios.post('http://localhost:5001/create-payment-intent', {
                amount: 5000, // Amount in cents ($50.00)
                currency: 'usd',
            });

            const { clientSecret } = data;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card },
            });

            if (result.error) {
                setPaymentStatus({ message: result.error.message, type: 'error' });
            } else if (result.paymentIntent.status === 'succeeded') {
                setPaymentStatus({ message: 'Payment successful!', type: 'success' });
            }
        } catch (error) {
            setPaymentStatus({ message: `Payment failed: ${error.message}`, type: 'error' });
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <CardElement className="stripe-element" />
                <button type="submit" disabled={!stripe}>Pay $50</button>
            </form>
            {paymentStatus && (
                <p className={`payment-status ${paymentStatus.type}`}>
                    {paymentStatus.message}
                </p>
            )}
        </div>
    );
};

// Main App Component
const App = () => (
    <div className="app-container">
        <h1>Stripe Payment</h1>
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    </div>
);

export default App;
