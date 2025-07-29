import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import dreambg from "../assets/dream-background.jpg";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const emotionColors = {
  Enjoyment: "#FFD700",
  Sadness: "#1E90FF",
  Anger: "#FF4500",
  Fear: "#8A2BE2",
  Disgust: "#228B22",
};

function SubconsciousTherapist() {
  const [dreams, setDreams] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiparagraph, setaiparagraph] = useState("");

  useEffect(() => {
    const fetchDreamsAndGraphs = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1. Get recent dreams
        const recentRes = await fetch("/api/dreams/recent", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!recentRes.ok) throw new Error("Failed to fetch recent dreams");
        const recentData = await recentRes.json();
        const userDreams = recentData.dreams || [];
        setDreams(userDreams);

        // 2. Send dreams to /graph
        const graphRes = await fetch("/api/dreams/graph", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dreams: userDreams }),
        });

        if (!graphRes.ok) throw new Error("Failed to fetch graph data");
        const graphJson = await graphRes.json();

        const { freqmap, adjgraph } = graphJson;

        // 3. Create intensity data
        const labels = userDreams.map((_, i) => `Day ${userDreams.length - i}`);
        const emotionIntensity = {};
        Object.keys(freqmap).forEach((emotion) => {
          emotionIntensity[emotion] = new Array(labels.length).fill(0);
        });

        userDreams.forEach((dream, index) => {
          const broadEmotions = (dream.emotion || []).map((e) => {
            const map = {
              joy: "Enjoyment", amusement: "Enjoyment", contentment: "Enjoyment", peace: "Enjoyment",
              happiness: "Enjoyment", excitement: "Enjoyment", satisfaction: "Enjoyment", love: "Enjoyment",
              relief: "Enjoyment", pride: "Enjoyment",

              lonely: "Sadness", heartbroken: "Sadness", gloomy: "Sadness", disappointed: "Sadness",
              hopeless: "Sadness", grieved: "Sadness", unhappy: "Sadness", lost: "Sadness",
              troubled: "Sadness", resigned: "Sadness", miserable: "Sadness",

              worried: "Fear", doubtful: "Fear", nervous: "Fear", anxious: "Fear", terrified: "Fear",
              panicked: "Fear", horrified: "Fear", desperate: "Fear", confused: "Fear", stressed: "Fear",

              annoyed: "Anger", frustrated: "Anger", peeved: "Anger", contrary: "Anger", bitter: "Anger",
              infuriated: "Anger", irritated: "Anger", mad: "Anger", cheated: "Anger", vengeful: "Anger",
              insulted: "Anger",

              dislike: "Disgust", revulsion: "Disgust", loathing: "Disgust", disapproving: "Disgust",
              offended: "Disgust", uncomfortable: "Disgust", nauseated: "Disgust", disturbed: "Disgust",
              withdrawn: "Disgust", aversion: "Disgust",
            };
            return map[e] || e;
          });

          for (let emotion of broadEmotions) {
            if (!emotionIntensity[emotion]) {
              emotionIntensity[emotion] = new Array(labels.length).fill(0);
            }
            emotionIntensity[emotion][index]++;
          }
        });

        setGraphData({ emotionFrequency: freqmap, emotionIntensity, labels });

        // 4. Send graphJson to Gemini
        const aianalysis = await fetch("/api/dreams/airesponse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ aiprompt: graphJson }), // ✅ Fixed
        });

        const aidata = await aianalysis.json();
        setaiparagraph(aidata.analysis);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err.message);
        alert("Something went wrong while generating analysis.");
        setLoading(false);
      }
    };

    fetchDreamsAndGraphs();
  }, []);

  if (loading || !graphData) {
    return <div className="text-white p-4">Loading your subconscious map...</div>;
  }

  const { emotionFrequency, emotionIntensity, labels } = graphData;

  const pieData = {
    labels: Object.keys(emotionFrequency),
    datasets: [
      {
        label: "Emotions Frequency",
        data: Object.values(emotionFrequency),
        backgroundColor: Object.keys(emotionFrequency).map((emotion) => emotionColors[emotion]),
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels,
    datasets: Object.keys(emotionIntensity).map((emotion) => ({
      label: emotion,
      data: emotionIntensity[emotion],
      backgroundColor: emotionColors[emotion],
    })),
  };

  return (
    <div className="relative bg-zinc-500 min-h-screen w-full p-6 text-white">
      <img
        src={dreambg}
        alt="bgimage"
        className="absolute inset-0 scale-105 object-cover w-full h-full blur-sm opacity-90"
      />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 bg-opacity-40 p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">Emotions Frequency</h2>
          <Pie data={pieData} />
          <div className="mt-3 text-sm"> Main Emotions
            <p className="text-yellow-300">🟡 Enjoyment - Bright emotions and joy</p>
            <p className="text-blue-400">🔵 Sadness - Feeling low or melancholic</p>
            <p className="text-red-500">🔴 Anger - Frustration or rage</p>
            <p className="text-purple-500">🟣 Fear - Anxiety or nervousness</p>
            <p className="text-green-500">🟢 Disgust - Rejection or aversion</p>
          </div>
        </div>

        <div className="bg-white/10 flex flex-col justify-center bg-opacity-40 p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">Emotion Intensity per Day</h2>
          <Bar data={barData} options={{ responsive: true }} />
          <div className="mt-3 text-sm">Main Emotions
            <p className="text-yellow-300">🟡 Enjoyment</p>
            <p className="text-blue-400">🔵 Sadness</p>
            <p className="text-red-500">🔴 Anger</p>
            <p className="text-purple-500">🟣 Fear</p>
            <p className="text-green-500">🟢 Disgust</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 bg-white/10 bg-opacity-40 p-4 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-2">🧠 Subconscious Therapist AI</h2>
        <p className="text-base whitespace-pre-line">
          {aiparagraph || "Analyzing emotional patterns..."}
        </p>
      </div>
    </div>
  );
}

export default SubconsciousTherapist;
