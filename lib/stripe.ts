import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2024-12-18.acacia' as any,
        typescript: true,
        appInfo: {
            name: 'Lapis Platform',
            version: '0.1.0'
        }
    })
    : null as unknown as Stripe;
