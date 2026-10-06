const express = require("express");
const axios = require("axios");
const protect = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// @route   POST /api/ai/review
// @desc    Sends user's solved code to Claude API, gets back feedback
// body: { code, problemTitle }
router.post("/review", async (req, res) => {
  try {
    const { code, problemTitle } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Please provide your code" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(400).json({
        message: "AI review is not configured. Add ANTHROPIC_API_KEY in your .env file to enable this feature.",
      });
    }

    const prompt = `You are reviewing a student's solution to the coding problem "${problemTitle || "Untitled"}".
Here is their code:

${code}

Give a short, encouraging review in this format:
1. Time Complexity: ...
2. Space Complexity: ...
3. Is there a better approach? (yes/no, and briefly why)
4. One quick tip to improve

Keep the whole response under 120 words.`;

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      }
    );

    const feedback = response.data.content[0].text;
    res.json({ feedback });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "AI review failed", error: err.message });
  }
});

module.exports = router;
