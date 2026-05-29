import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini API proxy endpoint
app.post('/api/gemini/parse', async (req, res) => {
  try {
    const { text, language = 'he' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const systemPrompt = `
אתה משורר קרטוגרפי ומנתח תיירות מעמיק.
עליך לקבל טקסט חופשי (עברית/אנגלית) המתאר טיול, ולנתח אותו לתוך מבנה נתונים קרטוגרפי מושלם לפי ימים ונקודות עניין (POIs).

חוקים קריטיים:
1. החזר אובייקט JSON תקני בלבד. ללא טקסט עודף לפניו או אחריו.
2. לכל נקודת עניין (POI), מצא קואורדינטות גיאוגרפיות (latitude, longitude) מדויקות ככל הניתן של המקום עצמו.
3. קטגוריות ה-POI האפשריות הן: 'hotel', 'restaurant', 'attraction', 'waypoint'.
4. המילים יהיו בעברית צחה, אך שמות מקומות או מלונות מומלץ לשמור בערכים מוכרים באנגלית/לטינית.

פורמט JSON נדרש בדיוק:
{
    "title": "שם מעורר השראה ופואטי לטיול",
    "description": "סיכום פילוסופי חיובי של הדרך",
    "days": [
        { "dayNumber": 1, "title": "נושא היום", "description": "מה מרגישים ועושים היום" }
    ],
    "pois": [
        {
            "dayNumber": 1,
            "name": "שם המקום בעברית או אנגלית",
            "category": "hotel / restaurant / attraction / waypoint",
            "locationName": "שם המיקום המלא לאיתור",
            "latitude": 45.434,
            "longitude": 12.338,
            "description": "תיאור קצר, פואטי ושימושי של הנקודה"
        }
    ]
}
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: 'application/json' },
      }
    );

    const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    const parsedData = JSON.parse(responseText);

    // Validate response structure
    if (!parsedData.title || !parsedData.description || !Array.isArray(parsedData.days) || !Array.isArray(parsedData.pois)) {
      throw new Error('Invalid response structure from AI');
    }

    // Add IDs to POIs
    const poisWithIds = parsedData.pois.map((poi, idx) => ({
      ...poi,
      id: `poi-ai-${idx}-${Date.now()}`,
      latitude: parseFloat(poi.latitude),
      longitude: parseFloat(poi.longitude),
    }));

    res.json({
      title: parsedData.title,
      description: parsedData.description,
      days: parsedData.days,
      pois: poisWithIds,
    });
  } catch (error) {
    console.error('Error processing request:', error);

    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({ error: 'Invalid API key or access denied' });
    }

    res.status(500).json({
      error: error.message || 'Failed to parse route',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 RouteAI Backend server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Gemini API configured: ${GEMINI_API_KEY ? 'yes' : 'NO'}`);
});
