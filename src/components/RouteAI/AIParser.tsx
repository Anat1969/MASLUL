import { useState } from 'react';
import type { Trip, POI } from '../../types/routes';
import { parseRouteWithAI } from '../../services/apiClient';

interface AIParserProps {
  activeTrip: Trip;
  onSaveTrip: (trip: Trip) => Promise<string>;
  onSetActiveTrip: (trip: Trip) => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
  onSetActiveTab: (tab: 'itinerary' | 'ai-parse' | 'add-place') => void;
}

export default function AIParser({
  activeTrip,
  onSaveTrip,
  onSetActiveTrip,
  onError,
  onSuccess,
  onSetActiveTab,
}: AIParserProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleParse = async () => {
    if (!inputText.trim()) {
      onError('אנא הכנס טקסט לניתוח');
      return;
    }

    setIsLoading(true);
    try {
      const result = await parseRouteWithAI({ text: inputText });

      // Create new trip with AI-parsed data
      const newDays = (result.days || []).map((day: any, idx: number) => ({
        dayNumber: idx + 1,
        title: day.title || `יום ${idx + 1}`,
        description: day.description || '',
      }));

      const newPois: POI[] = (result.pois || []).map((poi: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: poi.name,
        description: poi.description || '',
        category: poi.category as 'hotel' | 'restaurant' | 'attraction' | 'waypoint',
        dayNumber: poi.dayNumber || 1,
        latitude: poi.latitude || 0,
        longitude: poi.longitude || 0,
        locationName: poi.locationName || '',
      }));

      const updatedTrip: Trip = {
        ...activeTrip,
        title: result.title || activeTrip.title,
        description: result.description || activeTrip.description,
        days: newDays.length > 0 ? newDays : activeTrip.days,
        pois: newPois.length > 0 ? newPois : activeTrip.pois,
      };

      await onSaveTrip(updatedTrip);
      onSetActiveTrip(updatedTrip);
      onSuccess('המסלול עודכן בהצלחה מטקסט!');
      setInputText('');
      onSetActiveTab('itinerary');
    } catch (error) {
      onError('שגיאה בניתוח הטקסט. בדוק את ההקלד או נסה שוב.');
      console.error('Parse error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 space-y-3">
        <div>
          <label className="block text-[11px] font-bold text-stone-600 mb-2">
            תאר את המסלול שלך בטקסט חופשי:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="לדוגמא: יום ראשון - הגעתי למילאנו, לנתי במלון X. ביום שני ביקרתי בתאטרון לה סקאלה..."
            className="w-full h-40 p-3 border border-stone-200 rounded-xl font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-900"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleParse}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-stone-900 text-white font-bold text-sm rounded-xl hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                מעבד...
              </>
            ) : (
              <>
                ✨ ניתוח טקסט
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] text-stone-500 italic">
          בעזרת AI, המערכת תפענח את התיאור שלך ותיצור מסלול מפורט עם ימים, מקומות, וקטגוריות.
        </p>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200/50 p-3 rounded-xl space-y-2">
        <span className="text-[10px] font-bold text-blue-700 block">💡 עצות לתוצאות טובות:</span>
        <ul className="text-[9px] text-blue-600 space-y-1">
          <li>• ציין את שמות הערים והמקומות בבירור</li>
          <li>• הזכר סוגי אטרקציות (מלון, מסעדה, מוזיאון)</li>
          <li>• סדר את הטקסט לפי סדר כרונולוגי</li>
          <li>• כלול פרטים על מה שעשית בכל יום</li>
        </ul>
      </div>
    </div>
  );
}
