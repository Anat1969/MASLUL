import type { Trip, POI, POICategory } from '../../types/routes';

interface ItineraryProps {
  activeTrip: Trip;
  activeDayFilter: number;
  activeCategoryFilter: POICategory | 'all';
  onSetActiveDayFilter: (day: number) => void;
  onSetActiveCategoryFilter: (category: POICategory | 'all') => void;
  onPoiFocus: (poi: POI) => void;
  onStartEditPOI: (poiId: string) => void;
  onRemovePOI: (tripId: string, poiId: string) => Promise<string>;
  onError: (msg: string) => void;
}

const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'hotel':
      return { color: '#B45309', bg: '#FEF3C7', icon: '🏨' };
    case 'restaurant':
      return { color: '#047857', bg: '#D1FAE5', icon: '🍴' };
    case 'attraction':
      return { color: '#1D4ED8', bg: '#DBEAFE', icon: '🏛️' };
    default:
      return { color: '#78350F', bg: '#FFEDD5', icon: '🧭' };
  }
};

export default function Itinerary({
  activeTrip,
  activeDayFilter,
  activeCategoryFilter,
  onSetActiveDayFilter,
  onSetActiveCategoryFilter,
  onPoiFocus,
  onStartEditPOI,
  onRemovePOI,
  onError,
}: ItineraryProps) {
  const handleDeletePoi = async (poiId: string) => {
    try {
      await onRemovePOI(activeTrip.id, poiId);
    } catch (error) {
      onError('שגיאה בעת מחיקת היעד.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-stone-400">
          <span>סינון מפה קרטוגרפי</span>
          {(activeDayFilter !== 0 || activeCategoryFilter !== 'all') && (
            <button
              onClick={() => {
                onSetActiveDayFilter(0);
                onSetActiveCategoryFilter('all');
              }}
              className="text-stone-800 underline font-extrabold"
            >
              נקה סינון
            </button>
          )}
        </div>

        {/* Filter Days */}
        <div className="space-y-1">
          <span className="block text-[10px] font-bold text-stone-500">לפי ימי מסע:</span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onSetActiveDayFilter(0)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                activeDayFilter === 0
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              כל הימים
            </button>
            {activeTrip.days.map(d => (
              <button
                key={d.dayNumber}
                onClick={() => onSetActiveDayFilter(d.dayNumber)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                  activeDayFilter === d.dayNumber
                    ? 'bg-stone-900 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                יום {d.dayNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Categories */}
        <div className="space-y-1 pt-2 border-t border-stone-200/50">
          <span className="block text-[10px] font-bold text-stone-500">לפי סגנון ושימוש:</span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onSetActiveCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                activeCategoryFilter === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-white border border-stone-200 text-stone-600'
              }`}
            >
              הכל
            </button>
            {(['hotel', 'restaurant', 'attraction'] as const).map(cat => {
              const styles = getCategoryStyles(cat);
              const labels = {
                hotel: '🏨 מלונות',
                restaurant: '🍴 אוכל',
                attraction: '🏛️ אטרקציה',
              };

              return (
                <button
                  key={cat}
                  onClick={() => onSetActiveCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                    activeCategoryFilter === cat
                      ? 'text-white'
                      : 'bg-white border border-stone-200 hover:bg-gray-50'
                  }`}
                  style={
                    activeCategoryFilter === cat
                      ? { backgroundColor: styles.color }
                      : { color: styles.color }
                  }
                >
                  {labels[cat]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6 relative border-r border-stone-200 pr-4">
        {activeTrip.days.map((day) => {
          const dayPois = activeTrip.pois.filter(p => p.dayNumber === day.dayNumber);
          if (activeDayFilter !== 0 && activeDayFilter !== day.dayNumber) return null;

          return (
            <div key={day.dayNumber} className="relative space-y-3">
              {/* Timeline Dot */}
              <div className="absolute -right-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-white bg-stone-900 shadow"></div>

              {/* Day Header */}
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                  יום {day.dayNumber}
                </span>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  {day.title}
                </h3>
                <p className="text-xs text-stone-500 italic mt-0.5 leading-relaxed">
                  {day.description}
                </p>
              </div>

              {/* Day POIs */}
              <div className="space-y-2.5">
                {dayPois.length === 0 ? (
                  <div className="p-3 text-xs italic text-stone-400 border border-dashed border-stone-200 rounded-xl">
                    אין נקודות ממופות ביום זה.
                  </div>
                ) : (
                  dayPois.map(poi => {
                    if (activeCategoryFilter !== 'all' && poi.category !== activeCategoryFilter)
                      return null;

                    const styles = getCategoryStyles(poi.category);

                    return (
                      <div
                        key={poi.id}
                        onClick={() => onPoiFocus(poi)}
                        className="group p-3.5 bg-white border border-stone-200 rounded-xl hover:border-stone-900 hover:shadow transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                              style={{ backgroundColor: styles.bg }}
                            >
                              {styles.icon}
                            </div>
                            <div>
                              <h4 className="font-serif text-sm font-bold text-stone-950 group-hover:text-stone-800 leading-snug">
                                {poi.name}
                              </h4>
                              <p className="text-[9px] text-stone-400 font-mono mt-0.5">
                                📍 {poi.locationName}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartEditPOI(poi.id);
                              }}
                              className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900"
                              title="ערוך"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePoi(poi.id);
                              }}
                              className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900"
                              title="מחק"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {poi.description && (
                          <p className="text-[11px] text-stone-600 leading-relaxed mt-2 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                            {poi.description}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
