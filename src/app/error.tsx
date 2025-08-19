'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { logoutAction } from '@/lib/actions';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold">Something went wrong!</h1>
        <p className="mb-6 text-muted-foreground">An error occurred while processing your request. Please try again later.</p>
        <div className="flex space-x-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
