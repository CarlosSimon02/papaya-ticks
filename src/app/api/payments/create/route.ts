import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, email, name, eventId, ticketId } = body;

    // Ensure minimum amount ($0.50)
    const minAmount = 0.5;
    if (amount < minAmount) {
      return NextResponse.json(
        { error: `Minimum amount is $${minAmount}` },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Ticket for Event ${eventId}`,
              description: `Ticket purchase for event ${eventId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tickets/${ticketId}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tickets/${ticketId}/failure`,
      customer_email: email,
      metadata: {
        ticketId,
        eventId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 