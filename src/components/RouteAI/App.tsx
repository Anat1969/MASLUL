import { useState, useRef, useEffect } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { Trip } from '../../types/routes';
import { useTrips } from '../../hooks/useTrips';
import Sidebar from './Sidebar';
import Map from './Map';
import MobileTabBar from './MobileTabBar';

const DEFAULT_TRIP: Trip = {
  id: 'demo-italy',
  title: 'יומן קרטוגרפי: צפון איטליה והרי הדולומיטים',
  description: 'מסע חווייתי ופנורמי המשלב את רומנטיקת התעלות של ונציה, המים הצלולים של גארדה, והפסגות המשוננות של הדולומיטים.',
  days: [
    { dayNumber: 1, title: 'ונציה הרומנטית', description: 'התמקמות בעיר המים היפהפייה, שיט שקיעה ופינות נסתרות.' },
    { dayNumber: 2, title: 'אגם גארדה וסירמיונה', description: 'נופים פנורמיים, מבצר עתיק ורוח נעימה על המים.' },
    { dayNumber: 3, title: 'הפסגות המכושפות של הדולומיטים', description: 'מעבר אל אגם טורקיז משתקף ומסלולי הליכה קסומים בגובה רב.' }
  ],
  pois: [
    {
      id: 'poi-1',
      dayNumber: 1,
      name: 'מלון דניאלי (Hotel Danieli)',
      category: 'hotel',
      locationName: 'Hotel Danieli, Venice, Italy',
      latitude: 45.434,
      longitude: 12.342,
      description: 'מלון היסטורי יוקרתי ומעוצב הצופה אל לגונת ונציה.'
    },
    {
      id: 'poi-2',
      dayNumber: 1,
      name: 'כיכר סן מרקו',
      category: 'attraction',
      locationName: 'St. Mark\'s Square, Venice, Italy',
      latitude: 45.434,
      longitude: 12.338,
      description: 'כיכר מרכזית עוצרת נשימה עם ארכיטקטורה ביזנטית מרשימה.'
    },
    {
      id: 'poi-3',
      dayNumber: 1,
      name: 'טרטוריה אל גזטינו',
      category: 'restaurant',
      locationName: 'Trattoria Al Gazzettino, Venice, Italy',
      latitude: 45.436,
      longitude: 12.337,
      description: 'פסטה טרייה עם פירות ים מקומיים באווירה ונציאנית רומנטית.'
    },
  ]
};

export default function RouteAIApp() {
  const { trips, isLoading, saveTrip, deleteTrip, addPOIToTrip, updatePOI, removePOI } = useTrips([DEFAULT_TRIP]);

  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [activeDayFilter, setActiveDayFilter] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'hotel' | 'restaurant' | 'attraction' | 'waypoint'>('all');

  const [mobileActiveView, setMobileActiveView] = useState<'journal' | 'map'>('journal');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mapInstanceRef = useRef<LeafletMap | null>(null);

  // Set active trip on load
  useEffect(() => {
    if (!isLoading && trips.length > 0 && !activeTrip) {
      setActiveTrip(trips[0]);
    }
  }, [isLoading, trips, activeTrip]);

  const handleDeleteTrip = async (tripId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את המסע הזה?')) {
      try {
        await deleteTrip(tripId);
        if (activeTrip?.id === tripId) {
          setActiveTrip(trips[0] || null);
        }
        setSuccessMsg('המסע נמחק בהצלחה.');
      } catch (error) {
        setErrorMsg('שגיאה בעת מחיקת המסע.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-stone-900 mx-auto mb-4">
            <svg fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-stone-600 text-sm">טוען את הנתונים...</p>
        </div>
      </div>
    );
  }

  if (!activeTrip) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <p className="text-stone-600">אין מסעות זמינים.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#FAF8F5]">
      {/* SIDEBAR */}
      <Sidebar
        activeTrip={activeTrip}
        trips={trips}
        activeDayFilter={activeDayFilter}
        activeCategoryFilter={activeCategoryFilter}
        mobileActiveView={mobileActiveView}
        isLibraryOpen={isLibraryOpen}
        errorMsg={errorMsg}
        successMsg={successMsg}

        onSetActiveTrip={setActiveTrip}
        onSetActiveDayFilter={setActiveDayFilter}
        onSetActiveCategoryFilter={setActiveCategoryFilter}
        onSetLibraryOpen={setIsLibraryOpen}
        onClearError={() => setErrorMsg('')}
        onClearSuccess={() => setSuccessMsg('')}
        onDeleteTrip={handleDeleteTrip}
        onSaveTrip={saveTrip}
        onAddPOI={addPOIToTrip}
        onUpdatePOI={updatePOI}
        onRemovePOI={removePOI}

        onError={setErrorMsg}
        onSuccess={setSuccessMsg}
      />

      {/* MAP */}
      <main className={`flex-1 h-full relative ${mobileActiveView === 'journal' ? 'hidden lg:block' : 'block'}`}>
        <Map
          activeTrip={activeTrip}
          activeDayFilter={activeDayFilter}
          activeCategoryFilter={activeCategoryFilter}
          mapInstanceRef={mapInstanceRef}
        />
      </main>

      {/* MOBILE TAB BAR */}
      <MobileTabBar
        mobileActiveView={mobileActiveView}
        onSetMobileActiveView={setMobileActiveView}
      />
    </div>
  );
}
