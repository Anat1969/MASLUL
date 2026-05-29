interface TabNavigationProps {
  activeTab: 'itinerary' | 'ai-parse' | 'add-place';
  onSetActiveTab: (tab: 'itinerary' | 'ai-parse' | 'add-place') => void;
  editingPoiId: string | null;
}

export default function TabNavigation({
  activeTab,
  onSetActiveTab,
  editingPoiId,
}: TabNavigationProps) {
  return (
    <div className="flex border-b border-stone-100 bg-white text-xs font-bold">
      <button
        onClick={() => onSetActiveTab('itinerary')}
        className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
          activeTab === 'itinerary'
            ? 'border-stone-900 text-stone-900 bg-stone-50/50'
            : 'border-transparent text-stone-500 hover:text-stone-800'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        ציר זמן
      </button>
      <button
        onClick={() => onSetActiveTab('ai-parse')}
        className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
          activeTab === 'ai-parse'
            ? 'border-stone-900 text-stone-900 bg-stone-50/50'
            : 'border-transparent text-stone-500 hover:text-stone-800'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM19.071 4.929l-.707 3.536L14.828 9l3.536.707.707 3.536.707-3.536L24 9l-3.536-.707-.707-3.536z" />
        </svg>
        טקסט למפה (AI)
      </button>
      <button
        onClick={() => onSetActiveTab('add-place')}
        className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
          activeTab === 'add-place'
            ? 'border-stone-900 text-stone-900 bg-stone-50/50'
            : 'border-transparent text-stone-500 hover:text-stone-800'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {editingPoiId ? 'ערוך מיקום' : 'הוסף יעד'}
      </button>
    </div>
  );
}
