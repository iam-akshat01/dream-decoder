// App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Chat from './pages/Chat.jsx';
import Dreamdashboard from './pages/Dreamdashboard.jsx';

// Nested components
import DreamAnalysis from './components/DreamAnalysis';
import DreamHistory from './components/DreamHistory';
import SubconsciousTherapist from './components/SubconsciousTherapist';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<Chat />} />

      {/* Parent route for dashboard */}
      <Route path="/dream-dashboard" element={<Dreamdashboard />}>
        <Route path="analysis" element={<DreamAnalysis />} />
        <Route path="history" element={<DreamHistory />} />
        <Route path="therapist" element={<SubconsciousTherapist />} />
      </Route>
    </Routes>
  );
}

export default App;
