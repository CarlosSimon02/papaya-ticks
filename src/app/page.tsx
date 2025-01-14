'use client';

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Event, getAllEvents } from "@/lib/db";
import { EventCard } from "@/components/event-card";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      const allEvents = await getAllEvents();
      setEvents(allEvents);
    };
    loadEvents();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Upcoming Events</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </main>
    </div>
  );
}
