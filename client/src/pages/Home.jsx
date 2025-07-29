import { useNavigate } from "react-router-dom";
import dreambg from '../assets/dream-background.jpg';


function Home() {
  const navigate = useNavigate();
  const signUP = false;
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-900">
      <img
        src={dreambg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover scale-100 opacity-90"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent z-10" />

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 px-6 text-center text-white max-w-3xl animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight drop-shadow-lg">
          Welcome to DreamGPT
        </h1>
        <p className="text-lg md:text-xl font-light mb-10 text-white/90 leading-relaxed">
          Decode the secrets of your dreams 🌙 using the power of AI. Whether you're seeking emotional clarity,
          insights into your subconscious, or just curious to explore — DreamGPT gives you a mirror to your inner world.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-white/90 text-zinc-800 px-8 py-3 rounded-xl font-semibold hover:bg-white transition-all duration-300 shadow-lg hover:scale-105"
        >
          Login to Begin
        </button>
        <button
          onClick={() => {
            navigate('/login', { state: { signUP: true } });
          }}
          className="bg-white/90 text-zinc-800 px-8 py-3 ml-3 rounded-xl font-semibold hover:bg-white transition-all duration-300 shadow-lg hover:scale-105"
        >
          New User? Sign Up
        </button>
      </div>
    </div>
  );
}

export default Home;