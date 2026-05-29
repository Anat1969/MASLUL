import { useEffect, useState } from 'react';
import RouteAIApp from './components/RouteAI/App';
import { healthCheck } from './services/apiClient';
import './styles/globals.css';

function App() {
  const [apiConnected, setApiConnected] = useState(false);
  const [checkingApi, setCheckingApi] = useState(true);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const connected = await healthCheck();
        setApiConnected(connected);
      } catch {
        setApiConnected(false);
      } finally {
        setCheckingApi(false);
      }
    };

    checkApi();
  }, []);

  if (checkingApi) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-stone-900 mx-auto mb-4">
            <svg fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-stone-600 text-sm">טוען את האפליקציה...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouteAIApp />
      {!apiConnected && (
        <div className="fixed bottom-4 left-4 bg-amber-50 border-r-4 border-amber-500 text-amber-800 px-4 py-2 rounded text-sm z-50">
          ⚠️ שרת ה-API אינו מחובר. ייתכן שחלק מהתכונות לא יעבדו (כגון parsing עם AI).
        </div>
      )}
    </>
  );
}

export default App;
