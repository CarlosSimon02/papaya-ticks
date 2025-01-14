import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventCardProps {
  event: {
    id: string;
    name: string;
    date: Date;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {new Date(event.date).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
} 