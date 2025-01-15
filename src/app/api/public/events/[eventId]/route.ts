import { db, getEventById } from "@/lib/db";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

async function validateApiKey(apiKey: string) {
  const apiKeysRef = collection(db, "api_keys");
  const q = query(apiKeysRef, where("key", "==", apiKey));
  const snapshot = await getDocs(q);
  return !snapshot.empty ? snapshot.docs[0].data() : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const validKey = await validateApiKey(apiKey);
    if (!validKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const event = await getEventById((await params).eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only return event if it belongs to the API key's organizer
    if (event.createdBy !== validKey.organizerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
