
'use server'

require('dotenv').config();
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { z } from 'zod';
import webpush from 'web-push';
import { revalidatePath } from 'next/cache';

const vapidDetails = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    subject: process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
};

// This check must happen after dotenv.config() is called.
if (vapidDetails.publicKey && vapidDetails.privateKey) {
    webpush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);
}

// ---- Subscription Management ----

export async function saveSubscription(subscription: PushSubscription) {
    if (!subscription.endpoint) {
        console.error("Subscription endpoint is missing.");
        throw new Error("Invalid subscription object.");
    }
    
    const subscriptionsRef = collection(db, 'pushSubscriptions');
    // Check if the subscription already exists
    const q = query(subscriptionsRef, where("endpoint", "==", subscription.endpoint));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        await addDoc(subscriptionsRef, JSON.parse(JSON.stringify(subscription)));
    } else {
        console.log("Subscription already exists.");
    }
}

export async function deleteSubscription(subscription: PushSubscription) {
    if (!subscription.endpoint) {
        console.error("Subscription endpoint is missing for deletion.");
        return;
    }
    
    const subscriptionsRef = collection(db, 'pushSubscriptions');
    const q = query(subscriptionsRef, where("endpoint", "==", subscription.endpoint));
    const querySnapshot = await getDocs(q);

    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach((docSnapshot) => {
        deletePromises.push(deleteDoc(doc(db, 'pushSubscriptions', docSnapshot.id)));
    });

    await Promise.all(deletePromises);
}


// ---- Notification Sending ----

const NotificationSchema = z.object({
  title: z.string().min(1, { message: 'El título es requerido.' }),
  message: z.string().min(1, { message: 'El mensaje es requerido.' }),
  iconUrl: z.string().url({ message: 'URL de ícono no válida.' }).optional().or(z.literal('')),
  url: z.string().optional(),
});

type SendNotificationState = {
    message: string;
    success: boolean;
    error?: string | null;
}

export async function sendNotification(prevState: SendNotificationState, formData: FormData): Promise<SendNotificationState> {
     if (!vapidDetails.publicKey || !vapidDetails.privateKey || !vapidDetails.subject) {
        const errorMessage = 'Las claves VAPID no están configuradas en el servidor. Revisa el archivo .env y las instrucciones en README-NOTIFICATIONS.md.';
        console.error(errorMessage);
        return { message: errorMessage, success: false };
    }
    
    const validatedFields = NotificationSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            message: 'Error de validación: ' + validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    const { title, message, iconUrl, url } = validatedFields.data;

    const payload = JSON.stringify({
        title,
        message,
        icon: iconUrl || '/icon.png',
        data: {
            url: url || '/',
        }
    });

    try {
        const subscriptionsSnapshot = await getDocs(collection(db, 'pushSubscriptions'));
        if (subscriptionsSnapshot.empty) {
            return { message: 'No hay suscriptores a quienes enviar notificaciones.', success: false };
        }

        const notificationPromises = subscriptionsSnapshot.docs.map(doc => {
            const subscription = doc.data() as PushSubscription;
            return webpush.sendNotification(subscription, payload).catch(error => {
                // If a subscription is expired or invalid, delete it from Firestore
                if (error.statusCode === 404 || error.statusCode === 410) {
                    console.log('Subscription has expired or is no longer valid, deleting.');
                    return deleteDoc(doc.ref);
                } else {
                    console.error('Error sending notification, status code: ', error.statusCode);
                }
            });
        });

        await Promise.all(notificationPromises);
        
        revalidatePath('/admin/notifications');
        return { message: `Notificación enviada a ${subscriptionsSnapshot.size} suscriptores.`, success: true };
    } catch (error) {
        console.error('Error sending notifications:', error);
        return { message: 'Error del servidor al enviar las notificaciones.', success: false };
    }
}
