export interface Event {
    id: string;
    name: string;
    date: Date;
    createdAt: Date;
    createdBy: string;
    description?: string;
    location?: string;
    totalTickets: number;
    availableTickets: number;
    price: number; // 0 for free tickets
}

export interface Ticket {
    id: string;
    eventId: string;
    email: string;
    name: string;
    purchasedAt: Date;
    status: 'pending' | 'confirmed' | 'cancelled';
    userId?: string; // Optional, for logged-in users
    paymentId?: string;
} 