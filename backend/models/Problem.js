const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true },
    topic: {
      type: String,
      required: true,
      enum: ["Array", "String", "Hashing", "Two Pointers", "Sliding Window", "Recursion", "Tree", "Graph", "DP", "Greedy", "Other"],
    },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    link: { type: String, default: "" }, // e.g. LeetCode URL
    notes: { type: String, default: "" },

    // ---- Spaced Repetition fields ----
    // intervalIndex points into REVISION_INTERVALS (see utils/spacedRepetition.js)
    intervalIndex: { type: Number, default: 0 },
    nextRevisionDate: { type: Date, required: true },
    lastRevisedDate: { type: Date, default: null },
    timesRevised: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Speeds up the "what's due today" query, which filters by user + date
problemSchema.index({ user: 1, nextRevisionDate: 1 });

module.exports = mongoose.model("Problem", problemSchema);
