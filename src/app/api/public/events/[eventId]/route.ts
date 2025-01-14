import { db, getEventById } from "@/lib/db";
import { collection, getDocs, query, where } from "firebase/firestore";
import { headers } from "next/headers";
import { ratelimit } from '@/lib/rate-limit';

// We'll store API keys in a separate collection
async function validateApiKey(apiKey: string) {
  const apiKeysRef = collection(db, 'api_keys');
  const q = query(apiKeysRef, where("key", "==", apiKey));
  const snapshot = await getDocs(q);
  return !snapshot.empty ? snapshot.docs[0].data() : null;
}

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const headersList = headers();
  const apiKey = (await headersList).get("x-api-key");

  if (!apiKey) {
    return Response.json({ error: "API key required" }, { status: 401 });
  }

  const validKey = await validateApiKey(apiKey);
  if (!validKey) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  const event = await getEventById(params.eventId);

  if (!event) {
    return Response.json({ error: "Event not found" }, { status: 404 });
  }

  // Only return event if it belongs to the API key's organizer
  if (event.createdBy !== validKey.organizerId) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Rate limit by API key
  const { success } = await ratelimit.limit(apiKey ?? 'anonymous')
  
  if (!success) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  return Response.json({ event });
} 