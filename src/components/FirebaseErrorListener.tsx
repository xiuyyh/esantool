'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error: FirestorePermissionError) => {
      // In a real environment, we would log this or show a specific dev overlay.
      // For now, we use a toast to surface the issue to the admin.
      toast({
        variant: "destructive",
        title: "Security Protocol Violation",
        description: `Operation '${error.context.operation}' denied on ${error.context.path}. Check Security Rules.`,
      });
    });

    return () => unsubscribe();
  }, [toast]);

  return null;
}
