import dreambg from '../assets/dream-background.jpg';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
function Login() {
  const loc = useLocation();
  const check= loc.state?.signUP || false; // Check if signUP is true or false, default to false
  console.log(check);

const [user, setUser] = useState({
  username: '',
  email: '',
  password: ''
});


const handleLogin = async() => {
      if(!user.username || !user.password || (check && !user.email)) {
        alert('Please fill in all fields');
        return;
      }
      
      const endpoint = check ? '/api/auth/signup' : '/api/auth/login';
      const response= await fetch(endpoint, {method : 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(user)});
      const data= await response.json();
      if(response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);


        alert(data.message);
        window.location.href = '/chat'; // Redirect to chat page on success
      } else {
        alert(data.message);
      }
}


  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-500 group">
      {/* Background Image */}
      <img
        src={dreambg}
        alt="background"
        className="object-cover w-full h-screen opacity-70 transition duration-500 group-hover:blur-sm"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-0"></div>

      {/* Login Box */}
      <div className="absolute top-1/2 left-1/2 z-10 h-auto w-[36rem] bg-white/10 border-2 border-white rounded-xl backdrop-blur-md transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-in-out hover:scale-105 px-8 py-10 shadow-xl shadow-black/30">
        
        {/* Title */}
        <p className="text-white text-center text-3xl font-semibold mb-6">DREAMGPT</p>

        {/* Input Fields */}
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="👤 Username"
            value={user.username}
            onChange={(e) => setUser({...user, username: e.target.value})}
            className="p-3 rounded-md w-full bg-white/80 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:scale-[1.01] transition"
          />
          {check && (
            <input
              type="email"
              placeholder="👤 Email"
              value={user.email}
              onChange={(e) => setUser({...user, email:e.target.value})}
              className="p-3 rounded-md w-full bg-white/80 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:scale-[1.01] transition"
            />
          )}
          <input
            type="password"
            placeholder="🔒 Password"
            value={user.password}
            onChange={(e) => setUser({...user, password:e.target.value})}
            className="p-3 rounded-md w-full bg-white/80 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:scale-[1.01] transition"
          />

          <button onClick={handleLogin} className="bg-white text-zinc-700 font-semibold cursor-pointer rounded-md p-3 hover:bg-zinc-100 hover:shadow-md hover:shadow-white/40 transition">
            Login/SignUp
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;