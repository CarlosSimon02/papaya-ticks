import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {new Date(event.date).toLocaleString()}
          </p>
          <p className="text-sm font-medium">
            {event.availableTickets} tickets available
          </p>
          <p className="text-sm font-medium text-green-600">
            {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 