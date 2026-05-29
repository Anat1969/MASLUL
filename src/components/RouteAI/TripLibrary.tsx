import type { Trip } from '../../types/routes';

interface TripLibraryProps {
  trips: Trip[];
  activeTrip: Trip;
  onSetActiveTrip: (trip: Trip) => void;
  onSetLibraryOpen: (open: boolean) => void;
  onDeleteTrip: (tripId: string) => void;
  onSuccess: (msg: string) => void;
}

export default function TripLibrary({
  trips,
  activeTrip,
  onSetActiveTrip,
  onSetLibraryOpen,
  onDeleteTrip,
  onSuccess,
}: TripLibraryProps) {
  const handleDelete = (tripId: string) => {
    if (confirm('האם אתה בטוח? לא ניתן לבטל פעולה זו.')) {
      onDeleteTrip(tripId);
      onSuccess('המסלול נמחק בהצלחה.');
    }
  };

  const handleSelectTrip = (trip: Trip) => {
    onSetActiveTrip(trip);
    onSetLibraryOpen(false);
    onSuccess(`התחלת עבודה עם: ${trip.title}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between sticky top-0">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">📚 ארכיון המסעות</h2>
            <p className="text-xs text-stone-500 mt-1">בחר מסלול או צור חדש</p>
          </div>
          <button
            onClick={() => onSetLibraryOpen(false)}
            className="p-2 hover:bg-stone-200 rounded-xl text-stone-600 font-bold text-xl"
            title="סגור"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {trips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-stone-500 mb-2">אין מסעות ברשימה עדיין</p>
              <p className="text-xs text-stone-400">צור מסלול חדש כדי להתחיל</p>
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  activeTrip.id === trip.id
                    ? 'border-stone-900 bg-stone-50'
                    : 'border-stone-200 hover:border-stone-900 hover:bg-stone-50'
                }`}
              >
                <div onClick={() => handleSelectTrip(trip)} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-serif text-base font-bold text-stone-900">
                        {trip.title}
                      </h3>
                      <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">
                        {trip.description}
                      </p>
                    </div>
                    {activeTrip.id === trip.id && (
                      <span className="ml-2 px-2 py-1 bg-stone-900 text-white text-[9px] font-bold rounded-full">
                        פעיל
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 text-[10px] text-stone-500 pt-2 border-t border-stone-100">
                    <span>📅 {trip.days.length} ימים</span>
                    <span>📍 {trip.pois.length} יעדים</span>
                    <span>🏨 {trip.pois.filter(p => p.category === 'hotel').length} מלונות</span>
                  </div>
                </div>

                {/* Delete Button */}
                <div className="mt-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(trip.id);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                  >
                    🗑️ מחק מסלול
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50">
          <button
            onClick={() => onSetLibraryOpen(false)}
            className="w-full px-4 py-2.5 bg-stone-900 text-white font-bold text-sm rounded-xl hover:bg-stone-800 transition-all"
          >
            ✓ סגור
          </button>
        </div>
      </div>
    </div>
  );
}
