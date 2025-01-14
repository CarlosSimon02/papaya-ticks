'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { updateTicketStatus } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        await updateTicketStatus(params.ticketId as string, 'confirmed');
        toast({
          title: "Payment Successful",
          description: "Your ticket has been confirmed. Check your email for details.",
        });
        router.push('/profile');
      } catch (error) {
        console.error('Error confirming payment:', error);
      }
    };

    confirmPayment();
  }, [params.ticketId, router, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Payment...</h1>
        <p>Please wait while we confirm your payment.</p>
      </div>
    </div>
  );
} 