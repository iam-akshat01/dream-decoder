// Dreamdashboard.jsx
import { Outlet } from 'react-router-dom';
import dreambg from '../assets/dream-background.jpg';

function Dreamdashboard() {
  return (
    <div className="relative bg-zinc-500 min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <img
        src={dreambg}
        alt="bgimage"
        className="absolute inset-0 scale-105 object-cover w-full h-full blur-sm opacity-90"
      />
      {/* Page content */}
      <div className="relative z-10 p-4">
        <Outlet /> {/* This is where nested route components render */}
      </div>
    </div>
  );
}

export default Dreamdashboard;
