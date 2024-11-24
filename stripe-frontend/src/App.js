import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_live_51H5N3KKO7krI6NOy3Mr4e4ReNFkNL3ZfThzomL94t6c5D0Z8SjQ5jqSkfqvolbQZhooFPg710Vi6nXwCKTteKnRQ00fEoQpAAI'); // Replace with your Stripe Publishable Key

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentStatus, setPaymentStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const card = elements.getElement(CardElement);

        if (!stripe || !card) return;

        try {
            const { data } = await axios.post('http://localhost:5000/create-payment-intent', {
                amount: 5000, // Amount in cents ($50.00)
                currency: 'usd',
            });

            const { clientSecret } = data;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card },
            });

            if (result.error) {
                setPaymentStatus(result.error.message);
            } else if (result.paymentIntent.status === 'succeeded') {
                setPaymentStatus('Payment successful!');
            }
        } catch (error) {
            setPaymentStatus('Payment failed: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe}>Pay $50</button>
            <p>{paymentStatus}</p>
        </form>
    );
};

const App = () => (
    <Elements stripe={stripePromise}>
        <h1>Stripe Payment</h1>
        <CheckoutForm />
    </Elements>
);

export default App;
