const express = require("express");
const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const User = require("../models/User");
const protect = require("../middleware/auth");
const {
  getInitialRevisionDate,
  calculateNextRevision,
  resetRevisionOnForget,
} = require("../utils/spacedRepetition");
const { updateStreak } = require("../utils/streakTracker");

const router = express.Router();
router.use(protect);

// @route   POST /api/problems
// @desc    Add a new solved problem
router.post("/", async (req, res) => {
  try {
    const { title, topic, difficulty, link, notes } = req.body;

    if (!title || !topic) {
      return res.status(400).json({ message: "Title and topic are required" });
    }

    const problem = await Problem.create({
      user: req.user.id,
      title,
      topic,
      difficulty,
      link,
      notes,
      nextRevisionDate: getInitialRevisionDate(),
    });

    res.status(201).json({ message: "Problem added successfully", problem });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/problems
// @desc    Get all problems for logged-in user (search + pagination)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const filter = {
      user: req.user.id,
      ...(search && { title: { $regex: search, $options: "i" } }),
    };

    const total = await Problem.countDocuments(filter);
    const problems = await Problem.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalProblems: total,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/problems/due-today
// @desc    Problems whose nextRevisionDate is today or earlier (overdue included)
router.get("/due-today", async (req, res) => {
  try {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dueProblems = await Problem.find({
      user: req.user.id,
      nextRevisionDate: { $lte: endOfToday },
    }).sort({ nextRevisionDate: 1 });

    res.json({ dueProblems, count: dueProblems.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   PATCH /api/problems/:id/revise
// @desc    Mark a problem as revised - "remembered" or "forgot"
// body: { result: "remembered" | "forgot" }
router.patch("/:id/revise", async (req, res) => {
  try {
    const { result } = req.body; // "remembered" or "forgot"

    const problem = await Problem.findOne({ _id: req.params.id, user: req.user.id });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    let update;
    if (result === "forgot") {
      update = resetRevisionOnForget();
    } else {
      update = calculateNextRevision(problem.intervalIndex);
    }

    problem.intervalIndex = update.nextIntervalIndex;
    problem.nextRevisionDate = update.nextRevisionDate;
    problem.lastRevisedDate = new Date();
    problem.timesRevised += 1;
    await problem.save();

    // Update the user's daily streak since they engaged with revision today
    const user = await User.findById(req.user.id);
    const streakUpdate = updateStreak(user.lastActiveDate, user.currentStreak, user.longestStreak);
    user.currentStreak = streakUpdate.currentStreak;
    user.longestStreak = streakUpdate.longestStreak;
    user.lastActiveDate = streakUpdate.lastActiveDate;
    await user.save();

    res.json({
      message: "Revision recorded",
      problem,
      streak: { current: user.currentStreak, longest: user.longestStreak },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/problems/stats
// @desc    Topic-wise breakdown + totals for dashboard
router.get("/stats", async (req, res) => {
  try {
    const total = await Problem.countDocuments({ user: req.user.id });

    const topicBreakdown = await Problem.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const user = await User.findById(req.user.id);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const dueTodayCount = await Problem.countDocuments({
      user: req.user.id,
      nextRevisionDate: { $lte: endOfToday },
    });

    res.json({
      totalProblems: total,
      topicBreakdown,
      dueTodayCount,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   DELETE /api/problems/:id
router.delete("/:id", async (req, res) => {
  try {
    const problem = await Problem.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.json({ message: "Problem deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
