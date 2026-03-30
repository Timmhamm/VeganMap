import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

const VeganMap = dynamic(() => import('@/components/VeganMap'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full bg-green-50 flex items-center justify-center">
      <span className="text-green-700">Loading map…</span>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="absolute top-[10px] left-20 z-[1000] rounded-lg bg-white/95 px-4 py-2 shadow-md">
        <h1 className="text-lg font-semibold text-green-800">Vegan Map — Wilkes-Barre, PA</h1>
        <p className="text-sm text-green-600">Click a marker for vegan options & details</p>
      </div>
      <VeganMap />
    </main>
  );
}
