import { db } from "@/lib/db";
import { collection, getDocs, query, where } from "firebase/firestore";
import { headers } from "next/headers";
import { createTicket, getEventById } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function validateApiKey(apiKey: string) {
  const apiKeysRef = collection(db, 'api_keys');
  const q = query(apiKeysRef, where("key", "==", apiKey));
  const snapshot = await getDocs(q);
  return !snapshot.empty ? snapshot.docs[0].data() : null;
}

export async function POST(request: Request) {
  const headersList = headers();
  const apiKey = (await headersList).get("x-api-key");

  if (!apiKey) {
    return Response.json({ error: "API key required" }, { status: 401 });
  }

  const validKey = await validateApiKey(apiKey);
  if (!validKey) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json();
  const { eventId, quantity, customerEmail } = body;

  // Verify event exists and belongs to the API key's organizer
  const event = await getEventById(eventId);
  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.createdBy !== validKey.organizerId) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Create a pending ticket
  const ticketRef = await createTicket({
    eventId,
    name: customerEmail, // We'll use email as name for API purchases
    email: customerEmail,
    status: 'pending'
  });

  // Create Stripe checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/${ticketRef.id}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Ticket for ${event.name}`,
            description: `Ticket purchase for event ${event.name}`,
          },
          unit_amount: Math.round(event.price * 100), // Convert to cents
        },
        quantity: quantity,
      },
    ],
    customer_email: customerEmail,
    metadata: {
      eventId,
      ticketId: ticketRef.id,
      quantity,
    },
  });

  return Response.json({ 
    checkoutUrl: checkoutSession.url,
    sessionId: checkoutSession.id 
  });
} 