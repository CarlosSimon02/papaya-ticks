import { getFirestore, collection, doc, setDoc, addDoc, getDocs, query, orderBy, where, collectionGroup } from 'firebase/firestore';
import { app } from './firebase';

export type Event = {
    id: string;
    name: string;
    date: Date;
    createdAt: Date;
    createdBy: string;
}

export const db = getFirestore(app);

export const createEvent = async (userId: string, data: { name: string; date: Date }) => {
  const eventData = {
    ...data,
    createdAt: new Date(),
    createdBy: userId,
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