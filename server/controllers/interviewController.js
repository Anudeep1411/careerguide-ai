import Interview from "../models/Interview.js";

const QUESTION_BANK = {
  technical: [
    "Explain your strongest project architecture and your contribution.",
    "What is the difference between var, let and const in JavaScript?",
    "How do REST APIs work in a full-stack application?",
    "Explain authentication flow using JWT.",
    "How do you optimize a React application?",
    "What is the difference between SQL and NoSQL databases?",
    "Explain OOPs concepts with examples.",
    "How do you debug a production issue?",
    "What is Git and how do you use branches?",
    "Explain one data structure you use frequently.",
    "How would you design a simple login system?",
    "What is the difference between frontend and backend validation?",
    "Explain promises and async/await.",
    "How do you handle errors in APIs?",
    "What makes your resume suitable for this role?",
  ],
  hr: [
    "Tell me about yourself.",
    "Why should we hire you?",
    "Why do you want this role?",
    "What are your strengths and weaknesses?",
    "Tell me about a challenge you faced and how you solved it.",
    "Where do you see yourself in 3 years?",
    "Why do you want to join our company?",
    "How do you handle feedback?",
    "Describe a time you worked in a team.",
    "Are you comfortable learning new technologies quickly?",
  ],
  behavioral: [
    "Tell me about a time you took ownership of a task.",
    "Describe a situation where you had to learn something quickly.",
    "How do you manage deadlines?",
    "Tell me about a mistake you made and what you learned.",
    "How do you handle conflict in a team?",
    "Give an example of problem solving from your project.",
    "How do you prioritize tasks when multiple things are pending?",
    "Tell me about a time you improved something.",
    "How do you communicate technical issues to non-technical people?",
    "What motivates you as a fresher?",
  ],
};

function buildQuestions(type = "technical", count = 5, role = "this role") {
  const base = type === "mixed"
    ? [...QUESTION_BANK.technical, ...QUESTION_BANK.hr, ...QUESTION_BANK.behavioral]
    : QUESTION_BANK[type] || QUESTION_BANK.technical;

  return base.slice(0, Number(count || 5)).map((question, index) => ({
    id: index + 1,
    question: question.replace("this role", role || "this role"),
    answer: "",
    feedback: null,
  }));
}

export const startInterview = async (req, res) => {
  try {
    const { role = "Frontend Developer", level = "Fresher", type = "technical", questionCount = 5 } = req.body;
    const questions = buildQuestions(type, questionCount, role);

    const interview = await Interview.create({
      user: req.user._id,
      role,
      level,
      type,
      questionCount: Number(questionCount || 5),
      questions,
      status: "started",
    });

    res.status(201).json({
      success: true,
      message: "Interview questions generated",
      interview,
      questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to start interview",
      error: error.message,
    });
  }
};

export const answerInterview = async (req, res) => {
  try {
    const { interviewId, role, level, type, questions = [], answers = [], feedback = [], score = 0, weakAreas = [] } = req.body;

    let interview = null;

    if (interviewId) {
      interview = await Interview.findOne({ _id: interviewId, user: req.user._id });
    }

    if (!interview) {
      interview = new Interview({ user: req.user._id });
    }

    interview.role = role || interview.role || "Frontend Developer";
    interview.level = level || interview.level || "Fresher";
    interview.type = type || interview.type || "technical";
    interview.questions = questions;
    interview.answers = answers;
    interview.feedback = feedback;
    interview.score = Number(score || 0);
    interview.weakAreas = weakAreas;
    interview.status = "completed";

    await interview.save();

    res.json({
      success: true,
      message: "Interview practice saved",
      interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save interview",
      error: error.message,
    });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);

    res.json({
      success: true,
      interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load interviews",
      error: error.message,
    });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load interview",
      error: error.message,
    });
  }
};
