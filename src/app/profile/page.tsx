'use client';

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { getUserEvents } from "@/lib/db";
import { useEffect, useState } from "react";
import { EventCard } from "@/components/event-card";
import type { Event } from "@/lib/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (user) {
      const loadEvents = async () => {
        const userEvents = await getUserEvents(user.uid);
        setEvents(userEvents);
      };
      loadEvents();
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button onClick={() => router.push('/create-event')}>
            Create Event
          </Button>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Events</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 