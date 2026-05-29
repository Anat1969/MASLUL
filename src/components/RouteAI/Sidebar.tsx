import { useState } from 'react';
import type { Trip, POI, Day, POICategory } from '../../types/routes';
import TabNavigation from './TabNavigation';
import Itinerary from './Itinerary';
import AIParser from './AIParser';
import POIForm from './POIForm';
import TripLibrary from './TripLibrary';

interface SidebarProps {
  activeTrip: Trip;
  trips: Trip[];
  activeDayFilter: number;
  activeCategoryFilter: POICategory | 'all';
  isSidebarCollapsed: boolean;
  mobileActiveView: 'journal' | 'map';
  isLibraryOpen: boolean;
  errorMsg: string;
  successMsg: string;

  onSetActiveTrip: (trip: Trip) => void;
  onSetActiveDayFilter: (day: number) => void;
  onSetActiveCategoryFilter: (category: POICategory | 'all') => void;
  onSetSidebarCollapsed: (collapsed: boolean) => void;
  onSetLibraryOpen: (open: boolean) => void;
  onClearError: () => void;
  onClearSuccess: () => void;
  onDeleteTrip: (tripId: string) => void;
  onSaveTrip: (trip: Trip) => Promise<string>;
  onUpdateTrip: (tripId: string, updates: Partial<Trip>) => Promise<string>;
  onAddPOI: (tripId: string, poi: POI) => Promise<string>;
  onUpdatePOI: (tripId: string, poiId: string, updates: Partial<POI>) => Promise<string>;
  onRemovePOI: (tripId: string, poiId: string) => Promise<string>;

  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export default function Sidebar({
  activeTrip,
  trips,
  activeDayFilter,
  activeCategoryFilter,
  isSidebarCollapsed,
  mobileActiveView,
  isLibraryOpen,
  errorMsg,
  successMsg,

  onSetActiveTrip,
  onSetActiveDayFilter,
  onSetActiveCategoryFilter,
  onSetSidebarCollapsed,
  onSetLibraryOpen,
  onClearError,
  onClearSuccess,
  onDeleteTrip,
  onSaveTrip,
  onUpdateTrip,
  onAddPOI,
  onUpdatePOI,
  onRemovePOI,

  onError,
  onSuccess,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'ai-parse' | 'add-place'>('itinerary');
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);

  const handlePoiFocus = (poi: POI) => {
    // This will be handled by the parent component
  };

  return (
    <>
      <aside
        className={`w-full lg:w-[460px] bg-white border-l border-stone-200 flex flex-col h-full z-20 shadow-2xl transition-all duration-300 relative ${
          isSidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : ''
        } ${mobileActiveView === 'map' ? 'hidden lg:flex' : 'flex'}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-900 rounded-xl text-stone-100 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-2xl font-black text-stone-900">מסלולאי</h1>
              <p className="text-[10px] text-stone-500 font-serif italic mt-0.5">קרטוגרפיה חזותית מתוך סיפורי דרך</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSetLibraryOpen(!isLibraryOpen)}
              className="p-2 hover:bg-stone-100 rounded-xl text-stone-600 flex items-center gap-1.5 text-xs font-bold"
              title="ארכיון מסעות"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>ארכיון ({trips.length})</span>
            </button>
          </div>
        </div>

        {/* Trip Title Banner */}
        <div className="p-5 border-b border-stone-100 bg-white">
          <h2 className="font-serif text-lg font-bold text-stone-900 leading-tight">{activeTrip.title}</h2>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">{activeTrip.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="block font-serif text-base font-bold text-stone-800">{activeTrip.days.length}</span>
              <span className="text-[10px] text-stone-500">ימי מסע</span>
            </div>
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="block font-serif text-base font-bold text-stone-800">{activeTrip.pois.length}</span>
              <span className="text-[10px] text-stone-500">אתרים מופו</span>
            </div>
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="block font-serif text-base font-bold text-stone-800">
                {activeTrip.pois.filter(p => p.category === 'hotel').length}
              </span>
              <span className="text-[10px] text-stone-500">מלונות</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onSetActiveTab={setActiveTab}
          editingPoiId={editingPoiId}
        />

        {/* Status Messages */}
        {errorMsg && (
          <div className="m-3 p-3 bg-rose-50 border-r-4 border-rose-500 rounded text-rose-800 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={onClearError} className="font-bold">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="m-3 p-3 bg-stone-100 border-r-4 border-stone-900 rounded text-stone-800 text-xs flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={onClearSuccess} className="font-bold">✕</button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'itinerary' && (
            <Itinerary
              activeTrip={activeTrip}
              activeDayFilter={activeDayFilter}
              activeCategoryFilter={activeCategoryFilter}
              onSetActiveDayFilter={onSetActiveDayFilter}
              onSetActiveCategoryFilter={onSetActiveCategoryFilter}
              onPoiFocus={handlePoiFocus}
              onStartEditPOI={setEditingPoiId}
              onRemovePOI={onRemovePOI}
              onError={onError}
            />
          )}

          {activeTab === 'ai-parse' && (
            <AIParser
              activeTrip={activeTrip}
              onSaveTrip={onSaveTrip}
              onSetActiveTrip={onSetActiveTrip}
              onError={onError}
              onSuccess={onSuccess}
              onSetActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'add-place' && (
            <POIForm
              activeTrip={activeTrip}
              editingPoiId={editingPoiId}
              onSaveTrip={onSaveTrip}
              onSetActiveTrip={onSetActiveTrip}
              onAddPOI={onAddPOI}
              onUpdatePOI={onUpdatePOI}
              onError={onError}
              onSuccess={onSuccess}
              onResetForm={() => setEditingPoiId(null)}
              onSetActiveTab={setActiveTab}
            />
          )}
        </div>
      </aside>

      {/* Library Modal */}
      {isLibraryOpen && (
        <TripLibrary
          trips={trips}
          activeTrip={activeTrip}
          onSetActiveTrip={onSetActiveTrip}
          onSetLibraryOpen={onSetLibraryOpen}
          onDeleteTrip={onDeleteTrip}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
