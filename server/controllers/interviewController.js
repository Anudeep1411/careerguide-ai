import Interview from "../models/Interview.js";

const questionBank = {
  "Frontend Developer": [
    "Explain the difference between HTML, CSS and JavaScript.",
    "What is React and why do we use it?",
    "Explain useState and useEffect in React.",
    "What is responsive design?",
    "How do you optimize frontend performance?",
  ],

  "React Developer": [
    "What are components in React?",
    "Explain props vs state.",
    "What is useEffect used for?",
    "What are keys in React lists?",
    "How do you manage forms in React?",
  ],

  "Full Stack Developer": [
    "Explain frontend and backend communication.",
    "What is REST API?",
    "How does JWT authentication work?",
    "What is MongoDB and why use it?",
    "Explain your full-stack project architecture.",
  ],

  "MERN Stack Developer": [
    "What is the MERN stack?",
    "How does Express handle routes?",
    "How do React and Node.js communicate?",
    "What is Mongoose?",
    "How do you protect backend routes?",
  ],

  "Java Developer": [
    "Explain OOP concepts in Java.",
    "What is inheritance?",
    "What is exception handling?",
    "Difference between ArrayList and LinkedList?",
    "What is Spring Boot?",
  ],

  "DSA Interview": [
    "What is time complexity?",
    "Explain stack and queue.",
    "What is binary search?",
    "Explain BFS and DFS.",
    "What is dynamic programming?",
  ],

  "HR Interview": [
    "Tell me about yourself.",
    "Why should we hire you?",
    "What are your strengths and weaknesses?",
    "Tell me about your project.",
    "Where do you see yourself in 5 years?",
  ],
};

function getQuestions(role, count = 5) {
  const questions = questionBank[role] || questionBank["Frontend Developer"];

  return questions.slice(0, count).map((question) => ({
    question,
    userAnswer: "",
    score: 0,
    correctPoints: [],
    missingPoints: [],
    betterAnswer: "",
    followUpQuestion: "",
    weakArea: "",
  }));
}

function evaluateAnswer(question, answer) {
  const text = answer.toLowerCase();

  let score = 4;
  const correctPoints = [];
  const missingPoints = [];
  let weakArea = "Concept clarity";

  if (answer.length > 80) {
    score += 2;
    correctPoints.push("Answer has enough explanation.");
  } else {
    missingPoints.push("Answer is too short. Add more explanation.");
  }

  if (
    text.includes("example") ||
    text.includes("project") ||
    text.includes("real")
  ) {
    score += 1;
    correctPoints.push("Answer includes example or real-world connection.");
  } else {
    missingPoints.push("Add one practical example.");
  }

  if (
    text.includes("because") ||
    text.includes("used") ||
    text.includes("helps")
  ) {
    score += 1;
    correctPoints.push("Answer explains why the concept is useful.");
  } else {
    missingPoints.push("Explain why this concept is used.");
  }

  if (
    text.includes("time") ||
    text.includes("complexity") ||
    text.includes("performance")
  ) {
    score += 1;
    correctPoints.push("Answer mentions performance or complexity.");
  } else {
    missingPoints.push("Mention performance, complexity or impact if applicable.");
  }

  if (text.includes("react") || text.includes("api") || text.includes("data")) {
    score += 1;
    correctPoints.push("Answer uses relevant technical terms.");
  }

  score = Math.min(score, 10);

  if (score >= 8) {
    weakArea = "Minor improvement needed";
  } else if (score >= 6) {
    weakArea = "Need stronger examples";
  } else {
    weakArea = "Basic concept explanation";
  }

  const betterAnswer = `A better answer should define the concept, explain why it is used, give one real example, and mention important points related to the question: "${question}"`;

  const followUpQuestion = `Can you explain this concept with an example from your own project?`;

  return {
    score,
    correctPoints,
    missingPoints,
    betterAnswer,
    followUpQuestion,
    weakArea,
  };
}

export const startInterview = async (req, res) => {
  try {
    const { role, level, type, questionCount } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const questions = getQuestions(role, questionCount || 5);

    const interview = await Interview.create({
      user: req.user._id,
      role,
      level,
      type,
      questions,
      status: "started",
    });

    res.status(201).json({
      success: true,
      message: "Interview started successfully",
      interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to start interview",
      error: error.message,
    });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer } = req.body;

    if (!interviewId || questionIndex === undefined || !answer) {
      return res.status(400).json({
        success: false,
        message: "Interview ID, question index and answer are required",
      });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const questionItem = interview.questions[questionIndex];

    if (!questionItem) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const feedback = evaluateAnswer(questionItem.question, answer);

    interview.questions[questionIndex].userAnswer = answer;
    interview.questions[questionIndex].score = feedback.score;
    interview.questions[questionIndex].correctPoints = feedback.correctPoints;
    interview.questions[questionIndex].missingPoints = feedback.missingPoints;
    interview.questions[questionIndex].betterAnswer = feedback.betterAnswer;
    interview.questions[questionIndex].followUpQuestion = feedback.followUpQuestion;
    interview.questions[questionIndex].weakArea = feedback.weakArea;

    const answeredQuestions = interview.questions.filter(
      (q) => q.userAnswer && q.userAnswer.trim() !== ""
    );

    if (answeredQuestions.length > 0) {
      const totalScore = answeredQuestions.reduce(
        (sum, q) => sum + q.score,
        0
      );

      interview.overallScore = Math.round(
        totalScore / answeredQuestions.length
      );
    }

    interview.weakAreas = [
      ...new Set(
        interview.questions
          .map((q) => q.weakArea)
          .filter((area) => area && area.trim() !== "")
      ),
    ];

    if (answeredQuestions.length === interview.questions.length) {
      interview.status = "completed";
    }

    await interview.save();

    res.json({
      success: true,
      message: "Answer evaluated successfully",
      feedback: interview.questions[questionIndex],
      interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit answer",
      error: error.message,
    });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch interviews",
      error: error.message,
    });
  }
};

export const getSingleInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.json({
      success: true,
      interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview",
      error: error.message,
    });
  }
};