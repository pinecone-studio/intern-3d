import Sidebar from './components/sidebar';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold">Dashboard Content</h1>
      </div>
    </div>
  );
}
