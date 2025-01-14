'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { getEventById} from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TicketForm } from "@/components/ticket-form";
import { Event } from "@/lib/types";

export default function EventPage() {
  const params = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await getEventById(params.eventId as string);
        setEvent(eventData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [params.eventId, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{event.name}</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-lg font-medium">Date & Time</p>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleString()}
              </p>
            </div>

            {event.location && (
              <div className="space-y-2">
                <p className="text-lg font-medium">Location</p>
                <p className="text-gray-600">{event.location}</p>
              </div>
            )}

            {event.description && (
              <div className="space-y-2">
                <p className="text-lg font-medium">About this event</p>
                <p className="text-gray-600">{event.description}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-lg font-medium">Tickets</p>
              <p className="text-gray-600">
                {event.availableTickets} tickets available
              </p>
              <p className="text-xl font-bold text-green-600">
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="w-full"
                  disabled={event.availableTickets === 0}
                >
                  {event.availableTickets === 0 ? 'Sold Out' : 'Get Tickets'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Get Your Tickets</DialogTitle>
                </DialogHeader>
                <TicketForm event={event} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  );
} 