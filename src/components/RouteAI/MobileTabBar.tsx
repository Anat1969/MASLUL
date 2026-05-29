interface MobileTabBarProps {
  mobileActiveView: 'journal' | 'map';
  onSetMobileActiveView: (view: 'journal' | 'map') => void;
}

export default function MobileTabBar({
  mobileActiveView,
  onSetMobileActiveView,
}: MobileTabBarProps) {
  return (
    <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur shadow-2xl border border-stone-200/80 rounded-2xl flex p-1.5 gap-2 w-[280px]">
      <button
        onClick={() => onSetMobileActiveView('journal')}
        className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${
          mobileActiveView === 'journal' ? 'bg-stone-900 text-white' : 'text-stone-500'
        }`}
      >
        📔 יומן מסע
      </button>
      <button
        onClick={() => onSetMobileActiveView('map')}
        className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${
          mobileActiveView === 'map' ? 'bg-stone-900 text-white' : 'text-stone-500'
        }`}
      >
        🗺️ מפה אינטראקטיבית
      </button>
    </div>
  );
}
