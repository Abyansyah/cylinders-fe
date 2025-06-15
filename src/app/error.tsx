'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold">Something went wrong!</h1>
        <p className="mb-6 text-muted-foreground">An error occurred while processing your request. Please try again later.</p>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={() => reset()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
