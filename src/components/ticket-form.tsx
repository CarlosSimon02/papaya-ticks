'use client';

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createTicket } from "@/lib/db";
import type { Event } from "@/lib/types";

interface TicketFormProps {
  event: Event;
  onClose?: () => void;
}

export function TicketForm({ event, onClose }: TicketFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First create a pending ticket
      const ticketRef = await createTicket({
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        userId: user?.uid,
        status: 'pending',
      });

      if (event.price > 0) {
        // If event is not free, create Stripe invoice
        const response = await fetch('/api/payments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: event.price,
            email: formData.email,
            name: formData.name,
            eventId: event.id,
            ticketId: ticketRef.id,
          }),
        });

        const { url, error } = await response.json();
        
        if (error) {
          throw new Error(error);
        }

        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        // For free tickets, show success message
        toast({
          title: "Success!",
          description: "Your ticket has been reserved. Check your email for details.",
        });
        onClose?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Processing...' : event.price > 0 
          ? `Pay $${event.price.toFixed(2)}` 
          : 'Confirm Free Ticket'}
      </Button>
    </form>
  );
} 