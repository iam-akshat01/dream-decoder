const axios = require('axios');
const Dream = require('../models/Dreams');
const User = require('../models/User')

exports.submitDream = async (req, res) => {
  try {
    const dreamtext = req.body?.dreamtext;
    if (!dreamtext) {
      return res.status(400).json({ error: 'dreamtext is required' });
    }
    const userId = req.userId;  // Now from JWT

    const prompt = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${dreamtext}\n\nNow, based on the above dream description:

1. Analyze the dream and split your explanation into clear multiple paragraphs.

2. Return a JSON object with the following structure:
{
  "paragraphs": {
    "para1": "First paragraph of analysis",
    "para2": "Second paragraph of analysis",
    ...
  },
  "emotions": ["emotion1", "emotion2", ...]
}

Rules:
- Use keys like "para1", "para2", etc.
- Only use emotions from the list provided below.
- If no specific emotion is found, return an empty array.
- The response must only contain the JSON object — no text outside it.

Valid emotions list:
["happiness", "love", "relief", "contentment", "amusement", "joy", "pride", "excitement", "peace", "satisfaction",
"lonely", "heartbroken", "gloomy", "disappointed", "hopeless", "grieved", "unhappy", "lost", "troubled", "resigned", "miserable",
"worried", "doubtful", "nervous", "anxious", "terrified", "panicked", "horrified", "desperate", "confused", "stressed",
"annoyed", "frustrated", "peeved", "contrary", "bitter", "infuriated", "irritated", "mad", "cheated", "vengeful", "insulted",
"dislike", "revulsion", "loathing", "disapproving", "offended", "uncomfortable", "nauseated", "disturbed", "withdrawn", "aversion"]`
            }
          ]
        }
      ]
    };

    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    const apiKey = process.env.API_KEY;
    

    const response = await axios.post(
      `${endpoint}?key=${apiKey}`,
      prompt,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    //console.log("Gemini raw response:\n", raw);

    if (!raw) return res.status(500).json({ error: 'Invalid AI response' });

    // Remove markdown code block if present
    const cleanedRaw = raw.replace(/```json|```/g, '').trim();

    let aiOutput;
    try {
      aiOutput = JSON.parse(cleanedRaw);
    } catch (parseError) {
      console.error("JSON parse error:", parseError.message);
      return res.status(500).json({ error: "Failed to parse Gemini response" });
    }


    const savedDream = await Dream.create({
      userId,
      dreamtext,
      paragraph: aiOutput.paragraphs,
      emotion: aiOutput.emotions
    });

    await User.findByIdAndUpdate(
    userId,
    { $push: { posts: savedDream._id } },
    { new: true }
  );


    res.status(200).json({ message: 'Dream submitted and analyzed', dream: savedDream });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

exports.fetchDream = async (req,res) =>{
    try{
      const presdream= await Dream.findById(req.params.id);
      if(!presdream){
        return res.status(404).json({ message: 'Dream not found' });
      }
      res.status(200).json({dream: presdream});
    }
    
      catch (error) {
    console.error('Error fetching dream:', error);
    res.status(500).json({ message: 'Server error while fetching dream' });
  }
};

exports.getRecentDreams = async (req, res) => {
  const userIdFromToken = req.userId;
  /*console.log(userIdFromToken);*/
  

  try {
    let limit = parseInt(req.query.limit) || 7;

    const user = await User.findById(userIdFromToken).populate('posts');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Limit to available dreams
    limit = Math.min(limit, user.posts.length);

    // Fetch the most recent N dreams
    const recentDreams = await Dream.find({ userId: userIdFromToken })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ dreams: recentDreams });
  } catch (error) {
    console.error("Error fetching recent dreams:", error);
    res.status(500).json({ message: 'Server error while fetching dreams' });
  }
};

exports.getAnalysisGraphs = async (req, res) => {
  try {
    const dreamsarr = req.body?.dreams;
    if (!Array.isArray(dreamsarr)) {
      return res.status(400).json({ error: "Dreams data missing or invalid" });
    }

    // Mapping fine emotions to broad ones
    const emotionMap = {
      "joy": "Enjoyment", "amusement": "Enjoyment", "contentment": "Enjoyment", "peace": "Enjoyment", "happiness": "Enjoyment", "excitement": "Enjoyment", "satisfaction": "Enjoyment", "love": "Enjoyment", "relief": "Enjoyment", "pride": "Enjoyment",

      "lonely": "Sadness", "heartbroken": "Sadness", "gloomy": "Sadness", "disappointed": "Sadness", "hopeless": "Sadness", "grieved": "Sadness", "unhappy": "Sadness", "lost": "Sadness", "troubled": "Sadness", "resigned": "Sadness", "miserable": "Sadness",

      "worried": "Fear", "doubtful": "Fear", "nervous": "Fear", "anxious": "Fear", "terrified": "Fear", "panicked": "Fear", "horrified": "Fear", "desperate": "Fear", "confused": "Fear", "stressed": "Fear",

      "annoyed": "Anger", "frustrated": "Anger", "peeved": "Anger", "contrary": "Anger", "bitter": "Anger", "infuriated": "Anger", "irritated": "Anger", "mad": "Anger", "cheated": "Anger", "vengeful": "Anger", "insulted": "Anger",

      "dislike": "Disgust", "revulsion": "Disgust", "loathing": "Disgust", "disapproving": "Disgust", "offended": "Disgust", "uncomfortable": "Disgust", "nauseated": "Disgust", "disturbed": "Disgust", "withdrawn": "Disgust", "aversion": "Disgust",
    };

    const freqmap = {};
    const adjgraph = [];

    dreamsarr.forEach(dream => {
      const fineEmotions = dream.emotion || [];
      const broadEmotions = fineEmotions.map(e => emotionMap[e] || e); // fallback to original if no mapping

      // Count frequencies
      for (const broad of broadEmotions) {
        freqmap[broad] = (freqmap[broad] || 0) + 1;
      }

      // Create emotion chains
      for (let i = 0; i < broadEmotions.length - 1; i++) {
        adjgraph.push([broadEmotions[i], broadEmotions[i + 1]]);
      }
    });

    res.status(200).json({ freqmap, adjgraph });
  } catch (err) {
    console.error("Error generating analysis graphs:", err.message);
    res.status(500).json({ error: "Server error while generating emotion graphs" });
  }
};

exports.getAITherapist = async (req, res) => {
  try {
    const dataforprompt = req.body?.aiprompt;
    if (!dataforprompt) {
      return res.status(400).json({ error: 'dataforprompt is required' });
    }

    const userId = req.userId; // From JWT (middleware attached)

    const prompt = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${JSON.stringify(dataforprompt, null, 2)}\n\nAnalyze the following emotional data and summarize the emotional trends and patterns in one paragraph. The freqmap contains the frequency of each emotion experienced over the past few days, and the adjgraph shows the sequence and repetition of emotional transitions, including any loops or recurring patterns. Use both freqmap and adjgraph to provide a clear and insightful interpretation of the person’s emotional journey. Return only one paragraph as the output.Also, dont reveal any thing related to the frequency or the map . And based pon this, give the user therapy about what they should do to feel better.`
            }
          ]
        }
      ]
    };

    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    const apiKey = process.env.API_KEY;

    const response = await axios.post(
      `${endpoint}?key=${apiKey}`,
      prompt,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) {
      return res.status(500).json({ error: 'Invalid Gemini response' });
    }

    res.status(200).json({ analysis: result.trim() });
  } catch (err) {
    console.error("Error in getAITherapist:", err.message);
    res.status(500).json({ error: "Server error during AI emotional analysis" });
  }
};
