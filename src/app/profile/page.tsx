"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import {
  getUserEvents,
  createApiKey,
  getOrganizerApiKeys,
  deleteApiKey,
} from "@/lib/db";
import { useEffect, useState } from "react";
import { EventCard } from "@/components/event-card";
import type { ApiKey, Event } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        const [userEvents, userApiKeys] = await Promise.all([
          getUserEvents(user.uid),
          getOrganizerApiKeys(user.uid),
        ]);
        setEvents(userEvents);
        setApiKeys(userApiKeys);
      };
      loadData();
    }
  }, [user]);

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newKeyName.trim()) return;

    setLoading(true);
    try {
      const newKey = await createApiKey(user.uid, newKeyName.trim());
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName("");
      toast({
        title: "API Key Created",
        description:
          "Make sure to copy your API key now. You won't be able to see it again!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this API key? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteApiKey(keyId);
      setApiKeys(apiKeys.filter((key) => key.id !== keyId));
      toast({
        title: "API Key Deleted",
        description: "The API key has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button onClick={() => router.push("/create-event")}>
            Create Event
          </Button>
        </div>

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="api">API Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleCreateApiKey} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">New API Key Name</Label>
                      <div className="flex gap-2">
                        <Input
                          id="keyName"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="Enter a name for your API key"
                          required
                        />
                        <Button type="submit" disabled={loading}>
                          Create Key
                        </Button>
                      </div>
                    </div>
                  </form>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Your API Keys</h3>
                    {apiKeys.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No API keys yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {apiKeys.map((apiKey) => (
                          <div
                            key={apiKey.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{apiKey.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Created: {apiKey.createdAt.toLocaleDateString()}
                              </p>
                              {apiKey.key && (
                                <p className="mt-1 font-mono text-sm bg-muted p-1 rounded">
                                  {apiKey.key}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteApiKey(apiKey.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Integration Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      All API requests require an API key to be sent in the
                      header:
                    </p>
                    <pre className="bg-muted p-4 rounded-lg text-sm">
                      <code>X-API-Key: your_api_key_here</code>
                    </pre>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Endpoints</h3>

                    <div className="space-y-2">
                      <h4 className="font-medium">1. Get Event Details</h4>
                      <pre className="bg-muted p-4 rounded-lg text-sm">
                        <code>GET /api/public/events/{"{eventId}"}</code>
                      </pre>
                      <p className="text-sm text-muted-foreground">
                        Returns event details including ticket types and
                        availability.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">2. Create Ticket Purchase</h4>
                      <pre className="bg-muted p-4 rounded-lg text-sm">
                        <code>
                          POST /api/public/tickets{"\n"}
                          {"\n"}
                          {JSON.stringify(
                            {
                              eventId: "event_id",
                              quantity: 1,
                              customerEmail: "customer@example.com",
                            },
                            null,
                            2
                          )}
                        </code>
                      </pre>
                      <p className="text-sm text-muted-foreground">
                        Creates a ticket purchase and returns a Stripe checkout
                        URL.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Example Integration
                    </h3>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>
                        {`// Get event details
const response = await fetch(
  'https://papaya-ticks-dkgn.vercel.app/api/public/events/EVENT_ID',
  {
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  }
);
const { event } = await response.json();

// Create ticket purchase
const purchaseResponse = await fetch(
  'https://papaya-ticks-dkgn.vercel.app/api/public/tickets',
  {
    method: 'POST',
    headers: {
      'x-api-key': 'YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      eventId: 'EVENT_ID',
      quantity: 1,
      customerEmail: 'customer@example.com'
    })
  }
);
const { checkoutUrl } = await purchaseResponse.json();
window.location.href = checkoutUrl; // Redirect to payment`}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
