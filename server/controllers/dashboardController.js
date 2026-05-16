import Resume from "../models/Resume.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import JobMatch from "../models/JobMatch.js";
import Interview from "../models/Interview.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const resumes = await Resume.find({ user: userId }).sort({ createdAt: -1 });
    const analyses = await ResumeAnalysis.find({ user: userId }).sort({
      createdAt: -1,
    });
    const jobMatches = await JobMatch.find({ user: userId }).sort({
      createdAt: -1,
    });
    const interviews = await Interview.find({ user: userId }).sort({
      createdAt: -1,
    });

    const latestAnalysis = analyses[0];
    const latestJobMatch = jobMatches[0];
    const latestInterview = interviews[0];

    const weakAreas = [];

    if (latestAnalysis?.missingSkills?.length > 0) {
      weakAreas.push(...latestAnalysis.missingSkills.slice(0, 3));
    }

    if (latestJobMatch?.missingSkills?.length > 0) {
      weakAreas.push(...latestJobMatch.missingSkills.slice(0, 3));
    }

    if (latestInterview?.weakAreas?.length > 0) {
      weakAreas.push(...latestInterview.weakAreas.slice(0, 3));
    }

    const uniqueWeakAreas = [...new Set(weakAreas)].slice(0, 6);

    const recentActivities = [];

    if (resumes[0]) {
      recentActivities.push({
        type: "Resume Saved",
        title: resumes[0].title || "Untitled Resume",
        score: "Saved",
        date: resumes[0].createdAt,
      });
    }

    if (latestAnalysis) {
      recentActivities.push({
        type: "Resume Analyzed",
        title: latestAnalysis.targetRole,
        score: `${latestAnalysis.atsScore}/100`,
        date: latestAnalysis.createdAt,
      });
    }

    if (latestJobMatch) {
      recentActivities.push({
        type: "Job Match",
        title: latestJobMatch.companyName || latestJobMatch.targetRole,
        score: `${latestJobMatch.matchScore}/100`,
        date: latestJobMatch.createdAt,
      });
    }

    if (latestInterview) {
      recentActivities.push({
        type: "Interview Practice",
        title: `${latestInterview.role} Interview`,
        score: `${latestInterview.overallScore}/10`,
        date: latestInterview.createdAt,
      });
    }

    recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      stats: {
        savedResumes: resumes.length,
        resumeScore: latestAnalysis?.atsScore || 0,
        jobMatchScore: latestJobMatch?.matchScore || 0,
        interviewScore: latestInterview?.overallScore || 0,
        profileStrength: Math.min(
          40 +
            resumes.length * 15 +
            analyses.length * 10 +
            jobMatches.length * 10 +
            interviews.length * 10,
          100
        ),
      },
      weakAreas: uniqueWeakAreas,
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};
