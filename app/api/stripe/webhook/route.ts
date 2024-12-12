import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json(
            { error: 'Webhook signature verification failed' },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Get customer email from Stripe
                const customer = await stripe.customers.retrieve(customerId);
                //@ts-ignore
                const userEmail = customer.email;

                if (userEmail) {
                    // Update user's subscription status in Firestore
                    const userRef = doc(db, 'users', userEmail);
                    await setDoc(userRef, {
                        stripeCustomerId: customerId,
                        subscriptionStatus: subscription.status,
                        subscriptionId: subscription.id,
                        updatedAt: new Date().toISOString(),
                    }, { merge: true });
                }
                break;

            case 'customer.subscription.deleted':
                const deletedSubscription = event.data.object as Stripe.Subscription;
                const deletedCustomerId = deletedSubscription.customer as string;
                const deletedCustomer = await stripe.customers.retrieve(deletedCustomerId);
                //@ts-ignore
                if (deletedCustomer.email) {
                    //@ts-ignore
                    const userRef = doc(db, 'users', deletedCustomer.email);
                    await setDoc(userRef, {
                        subscriptionStatus: 'canceled',
                        updatedAt: new Date().toISOString(),
                    }, { merge: true });
                }
                break;
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler failed:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
} 