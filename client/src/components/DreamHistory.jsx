import dreambg from '../assets/dream-background.jpg';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DreamHistory() {
  const [dreams, setDreams] = useState([]);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const id = user?._id;
  const navigate = useNavigate();

  const colours = [
    "bg-purple-200/40", 
    "bg-yellow-200/40", 
    "bg-red-200/40", 
    "bg-green-200/40", 
    "bg-blue-200/40"
  ];

 useEffect(() => {
  const fetchRecentDreams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dreams/recent', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent dreams');
      }

      const data = await response.json();
      setDreams(data.dreams || []);
    } catch (error) {
      console.error("Error:", error.message);
      alert("Could not fetch dreams");
    }
  };

  fetchRecentDreams();
}, []);

  const handleView = (dreamId) => {
    navigate('/dream-dashboard/analysis', {
        state: { recentdreamid: dreamId},
      });
  };

  return (
    <div className="relative bg-zinc-500 min-h-screen w-full overflow-x-hidden">
      <img
        src={dreambg}
        alt="backgroundimg"
        className="absolute inset-0 object-cover w-full h-full blur-sm opacity-90"
      />

      <div className="absolute left-1/2 top-1/2 h-[90%] w-[90%] bg-white/30 border-2 border-white rounded-xl -translate-x-1/2 -translate-y-1/2 overflow-y-scroll custom-scroll p-5">
        <h1 className="text-center text-3xl text-white mb-6 font-bold drop-shadow">
          🌙 Your Last Seven Dreams 🌙
        </h1>

        <div className="flex flex-col gap-4">
          {dreams.map((dream, index) => (
            <div
              key={dream._id}
              className={`p-5 rounded-xl shadow-md ${colours[Math.floor(Math.random() * colours.length)]}`}
            >
              <p className="text-lg text-white font-semibold">
                <span className="text-white/80">Dream:</span> {dream.dreamtext.slice(0, 150)}...
              </p>

              <button
                className="mt-3 px-4 py-1 bg-white/70 text-black rounded-md font-semibold hover:bg-white transition-all"
                onClick={() => handleView(dream._id)}
              >
                View Dream
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DreamHistory;
