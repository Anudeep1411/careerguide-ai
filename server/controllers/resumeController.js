import Resume from "../models/Resume.js";

function getUserId(req) {
  return req.user?._id || req.user?.id;
}

export const createResume = async (req, res) => {
  try {
    const userId = getUserId(req);

    const resume = await Resume.create({
      ...req.body,
      user: userId,
    });

    res.status(201).json({
      success: true,
      message: "Resume saved successfully",
      resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save resume",
      error: error.message,
    });
  }
};

export const getMyResumes = async (req, res) => {
  try {
    const userId = getUserId(req);

    const resumes = await Resume.find({ user: userId })
      .sort({ updatedAt: -1 })
      .select(
        "title personalDetails.name personalDetails.email careerDetails.targetRole template resumeChecklist createdAt updatedAt"
      );

    res.json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch resumes",
      error: error.message,
    });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const userId = getUserId(req);

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch resume",
      error: error.message,
    });
  }
};

export const updateResume = async (req, res) => {
  try {
    const userId = getUserId(req);

    const resume = await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        user: userId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.json({
      success: true,
      message: "Resume updated successfully",
      resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update resume",
      error: error.message,
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const userId = getUserId(req);

    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete resume",
      error: error.message,
    });
  }
};