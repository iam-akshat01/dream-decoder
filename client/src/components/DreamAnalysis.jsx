import dreambg from '../assets/dream-background.jpg';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function extractParagraphs(paragraphObject) {
  if (!paragraphObject || typeof paragraphObject !== 'object') return [];
  return Object.keys(paragraphObject)
    .sort() // para1, para2, para3,...
    .map((key) => paragraphObject[key]);
}

function DreamAnalysis() {
  const location= useLocation();
  const id=location.state?.recentdreamid;
  const [paragraphs, setParagraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDream = async () => {
      try {
        const response = await fetch(`/api/dreams/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dream');
        }

        const data = await response.json();
        const extracted = extractParagraphs(data.dream.paragraph);
        setParagraphs(extracted);
      } catch (err) {
        console.error('Error fetching dream:', err);
        setErrorMsg('Failed to load dream. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDream();
  }, [id]);

  return (
    <div className="relative bg-zinc-500 min-h-screen w-full overflow-x-hidden">
      <img
        src={dreambg}
        alt="bgimage"
        className="absolute inset-0 object-cover w-full h-full blur-sm opacity-90"
      />

      <div className="absolute top-1/2 left-1/2 p-6 transform -translate-x-1/2 -translate-y-1/2 
        text-white bg-white/10 h-[90%] w-[90%] border-2 border-white rounded-xl 
        overflow-y-auto overflow-x-hidden custom-scroll z-10">

        <h1 className="text-4xl font-bold mb-6 text-center">Dream Analysis</h1>

        {loading && <p className="text-center text-xl">Loading...</p>}
        {errorMsg && <p className="text-center text-red-400 text-xl">{errorMsg}</p>}

        <div className="space-y-6 text-lg text-justify px-2 md:px-6">
          {paragraphs.map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DreamAnalysis;
