import { getFirestore, collection, doc, setDoc, addDoc, getDocs, query, orderBy, where, collectionGroup, updateDoc, increment, getDoc, deleteDoc } from 'firebase/firestore';
import { app } from './firebase';
import type { ApiKey, Event } from '@/lib/types';

export const db = getFirestore(app);

export const createEvent = async (userId: string, data: {
  name: string;
  date: Date;
  description?: string;
  location?: string;
  totalTickets: number;
  price: number;
}) => {
  const eventData = {
    ...data,
    createdAt: new Date(),
    createdBy: userId,
    availableTickets: data.totalTickets,
  };

  const userEventsRef = collection(db, 'users', userId, 'events');
  const docRef = await addDoc(userEventsRef, eventData);
  return docRef;
};

export const getAllEvents = async () => {
  const eventsSnapshot = await getDocs(
    query(
      collectionGroup(db, 'events'),
      orderBy('date', 'asc')
    )
  );
  
  return eventsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate()
    };
  }) as Event[];
};

export const getUserEvents = async (userId: string) => {
  const userEventsRef = collection(db, 'users', userId, 'events');
  const eventsSnapshot = await getDocs(
    query(userEventsRef, orderBy('date', 'asc'))
  );
  
  return eventsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate()
    };
  }) as Event[];
};

export const getEventById = async (eventId: string) => {
  const eventsSnapshot = await getDocs(
    query(collectionGroup(db, 'events'))
  );
  
  const event = eventsSnapshot.docs.find(doc => doc.id === eventId);
  if (!event) return null;

  const data = event.data();
  return {
    id: event.id,
    ...data,
    date: data.date.toDate(),
    createdAt: data.createdAt.toDate()
  } as Event;
};

export const createTicket = async (data: {
  eventId: string;
  name: string;
  email: string;
  userId?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
}) => {
  const ticketData = {
    ...data,
    purchasedAt: new Date(),
    status: 'confirmed',
  };

  const ticketsRef = collection(db, 'tickets');
  const ticketRef = await addDoc(ticketsRef, ticketData);

  return ticketRef;
};

export const updateTicketStatus = async (ticketId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
  const ticketRef = doc(db, 'tickets', ticketId);
  await updateDoc(ticketRef, { status });

  if (status === 'confirmed') {
    const ticketSnap = await getDoc(ticketRef);
    const ticketData = ticketSnap.data();
    
    if (ticketData) {
      const event = await getEventById(ticketData.eventId);
      if (event) {
        const eventRef = doc(db, `users/${event.createdBy}/events/${ticketData.eventId}`);
        await updateDoc(eventRef, {
          availableTickets: increment(-1)
        });
      }
    }
  }
};

export const createApiKey = async (organizerId: string, name: string) => {
  // Generate a random API key
  const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const apiKeyData = {
    organizerId,
    key,
    name,
    createdAt: new Date(),
  };

  const apiKeysRef = collection(db, 'api_keys');
  const docRef = await addDoc(apiKeysRef, apiKeyData);
  return { id: docRef.id, ...apiKeyData };
};

export const getOrganizerApiKeys = async (organizerId: string) => {
  const apiKeysRef = collection(db, 'api_keys');
  const q = query(apiKeysRef, where("organizerId", "==", organizerId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as ApiKey[];
};

export const deleteApiKey = async (apiKeyId: string) => {
  const apiKeyRef = doc(db, 'api_keys', apiKeyId);
  await deleteDoc(apiKeyRef);
}; 