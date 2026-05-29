import { useState } from 'react';
import type { Trip, POI, POICategory } from '../../types/routes';
import { geocodeLocation } from '../../services/nominatimService';

interface POIFormProps {
  activeTrip: Trip;
  editingPoiId: string | null;
  onAddPOI: (tripId: string, poi: POI) => Promise<string>;
  onUpdatePOI: (tripId: string, poiId: string, updates: Partial<POI>) => Promise<string>;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
  onResetForm: () => void;
  onSetActiveTab: (tab: 'itinerary' | 'ai-parse' | 'add-place') => void;
}

const categoryLabels: Record<POICategory | 'waypoint', string> = {
  hotel: '🏨 מלון',
  restaurant: '🍴 מסעדה',
  attraction: '🏛️ אטרקציה',
  waypoint: '🧭 נקודת דרך',
};

export default function POIForm({
  activeTrip,
  editingPoiId,
  onAddPOI,
  onUpdatePOI,
  onError,
  onSuccess,
  onResetForm,
  onSetActiveTab,
}: POIFormProps) {
  const editingPoi = activeTrip.pois.find(p => p.id === editingPoiId);

  const [formData, setFormData] = useState({
    name: editingPoi?.name || '',
    description: editingPoi?.description || '',
    category: editingPoi?.category || 'attraction' as POICategory | 'waypoint',
    dayNumber: editingPoi?.dayNumber || 1,
    locationName: editingPoi?.locationName || '',
    latitude: editingPoi?.latitude?.toString() || '',
    longitude: editingPoi?.longitude?.toString() || '',
  });

  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGeocode = async () => {
    if (!formData.locationName.trim()) {
      onError('אנא הכנס שם מקום לחיפוש');
      return;
    }

    setIsGeocodingLoading(true);
    try {
      const result = await geocodeLocation(formData.locationName);
      if (result) {
        setFormData(prev => ({
          ...prev,
          latitude: result.latitude.toString(),
          longitude: result.longitude.toString(),
        }));
        onSuccess('מיקום חוקי נמצא!');
      } else {
        onError('לא הצלחנו למצוא את המקום. נסה שם אחר.');
      }
    } catch (error) {
      onError('שגיאה בחיפוש גיאוגרפי. בדוק את ההקלד.');
      console.error('Geocode error:', error);
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      onError('אנא הכנס שם ליעד');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      onError('אנא בחר מיקום על המפה');
      return;
    }

    setIsSubmitting(true);
    try {
      const poi: POI = {
        id: editingPoiId || Math.random().toString(36).substr(2, 9),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        dayNumber: formData.dayNumber,
        locationName: formData.locationName,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      if (editingPoiId) {
        await onUpdatePOI(activeTrip.id, editingPoiId, poi);
        onSuccess('היעד עודכן בהצלחה!');
      } else {
        await onAddPOI(activeTrip.id, poi);
        onSuccess('היעד נוסף בהצלחה!');
      }

      resetForm();
      onSetActiveTab('itinerary');
    } catch (error) {
      onError('שגיאה בשמירת היעד.');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'attraction',
      dayNumber: 1,
      locationName: '',
      latitude: '',
      longitude: '',
    });
    onResetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
          שם היעד *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="לדוגמא: כנסיית דומו"
          className="w-full px-3 py-2 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          disabled={isSubmitting}
        />
      </div>

      {/* Category & Day */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
            קטגוריה
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as POICategory }))}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            disabled={isSubmitting}
          >
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
            יום במסע *
          </label>
          <select
            value={formData.dayNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, dayNumber: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            disabled={isSubmitting}
          >
            {activeTrip.days.map(day => (
              <option key={day.dayNumber} value={day.dayNumber}>
                יום {day.dayNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location Search */}
      <div>
        <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
          חיפוש מקום *
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.locationName}
            onChange={(e) => setFormData(prev => ({ ...prev, locationName: e.target.value }))}
            placeholder="לדוגמא: מילאנו, איטליה"
            className="flex-1 px-3 py-2 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            disabled={isGeocodingLoading || isSubmitting}
          />
          <button
            type="button"
            onClick={handleGeocode}
            disabled={isGeocodingLoading || isSubmitting}
            className="px-3 py-2 bg-stone-200 text-stone-800 font-bold text-sm rounded-lg hover:bg-stone-300 disabled:opacity-50 transition-all"
          >
            {isGeocodingLoading ? '🔍...' : '🔍'}
          </button>
        </div>
      </div>

      {/* Coordinates */}
      {formData.latitude && formData.longitude && (
        <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/50 text-[10px] text-stone-600 font-mono">
          <p>📍 Lat: {parseFloat(formData.latitude).toFixed(4)}</p>
          <p>📍 Lng: {parseFloat(formData.longitude).toFixed(4)}</p>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
          תיאור (אופציונלי)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="פרטים נוספים על המקום..."
          className="w-full h-24 p-3 border border-stone-200 rounded-lg font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-900"
          disabled={isSubmitting}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isGeocodingLoading}
          className="flex-1 px-4 py-2.5 bg-stone-900 text-white font-bold text-sm rounded-xl hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? '⏳ שומר...' : editingPoiId ? '✏️ עדכן יעד' : '➕ הוסף יעד'}
        </button>
        <button
          type="button"
          onClick={resetForm}
          disabled={isSubmitting}
          className="px-4 py-2.5 bg-stone-100 text-stone-700 font-bold text-sm rounded-xl hover:bg-stone-200 disabled:opacity-50 transition-all"
        >
          ✕ ביטול
        </button>
      </div>
    </form>
  );
}
