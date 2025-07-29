import dreambg from '../assets/dream-background.jpg';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Chat() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ignoreOutsideClick, setIgnoreOutsideClick] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [dream, setDream] = useState('');
  const [loading, setLoading] = useState(false); // 🔄 New state
  const navigate = useNavigate();

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ignoreOutsideClick) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ignoreOutsideClick]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleMenu = () => {
    setIgnoreOutsideClick(true);
    setMenuOpen((prev) => !prev);
    setTimeout(() => setIgnoreOutsideClick(false), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dream.trim() === '') {
      alert('Please enter a dream');
      return;
    }

    setLoading(true); // 🔄 Start loading

    try {
      const response = await fetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dreamtext: dream }),
      });

      const data = await response.json();
      setDream('');
      navigate('/dream-dashboard/analysis', {
        state: { recentdreamid: data.dream._id },
      });
    } catch (err) {
      console.error('Failed to submit dream:', err);
      setLoading(false); // Stop loading on error
    }
  };

  return (
    <div className="relative bg-zinc-500 min-h-screen w-full overflow-hidden">
      {/* Background */}
      <img
        src={dreambg}
        alt="bgimage"
        className="absolute inset-0 scale-105 object-cover w-full h-full blur-sm opacity-90"
      />

      {/* Toggle Button */}
      <button
        ref={buttonRef}
        onClick={handleToggleMenu}
        className="absolute top-4 left-4 z-50 text-white text-2xl border-2 border-white rounded-md p-2 hover:bg-white/20 hover:scale-105 transition cursor-pointer"
      >
        {menuOpen ? '✖' : '☰'}
      </button>

      {/* Animated Menu */}
      <div
        ref={menuRef}
        className={`menu absolute top-20 left-4 z-40 bg-white/10 backdrop-blur-xl border-2 border-white rounded-xl p-6 text-white transition-all duration-500 ease-in-out transform ${
          menuOpen
            ? 'opacity-100 scale-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-x-5 pointer-events-none'
        }`}
      >
        <ul className="space-y-4 text-lg">
          <li
            className="cursor-pointer hover:underline"
            onClick={() => {
              setMenuOpen(false);
              navigate('/dream-dashboard/therapist');
            }}
          >
            🛋️ Subconscious Therapist
          </li>
          <li
            className="cursor-pointer hover:underline"
            onClick={() => {
              setMenuOpen(false);
              navigate('/dream-dashboard/history');
            }}
          >
            📜 Dream History
          </li>
          <li
            className="cursor-pointer hover:underline"
            onClick={() => {
              localStorage.removeItem('token');
              setMenuOpen(false);
              navigate('/');
            }}
          >
            ➡️ Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-center text-white z-10 px-4">
        <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
          🌙 Introducing DreamGPT
        </h1>
        <p className="text-lg font-light max-w-xl mx-auto mt-6 drop-shadow-md">
          Discover how your dreams connect to your emotions. Submit a dream and
          get insights into your subconscious mind.
        </p>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0"></div>

      {/* Input Bar or Loader */}
      <div className="absolute bottom-6 left-0 right-0 px-6 z-10">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-4 bg-white/20 backdrop-blur-md rounded-full p-3 shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center w-full text-white font-semibold text-lg">
              ⏳ Analyzing your dream...
            </div>
          ) : (
            <>
              <input
                type="text"
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                placeholder="Type what you dreamt...☁️"
                className="flex-1 px-4 py-2 text-white bg-transparent placeholder-white focus:outline-none text-base"
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600 transition text-white px-5 py-2 rounded-full font-semibold cursor-pointer"
              >
                Send
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default Chat;
