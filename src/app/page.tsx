import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg text-gray-700">Mengalihkan ke halaman login...</p>
    </div>
  );
}
