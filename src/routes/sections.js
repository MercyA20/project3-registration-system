import { Router } from "express";
import mongoose from "mongoose";

import { Section } from "../models/Section.js";
import { Course } from "../models/Course.js";
import { Faculty } from "../models/Faculty.js";

const router = Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// CREATE a section
router.post("/", async (req, res) => {
  try {
    const {
      sectionNumber,
      courseId,
      facultyId,
      semester,
      year,
      room
    } = req.body;

    if (
      !sectionNumber ||
      !courseId ||
      !facultyId ||
      !semester ||
      year === undefined ||
      !room
    ) {
      return res.status(400).json({
        error:
          "Section number, course, faculty, semester, year, and room are required."
      });
    }

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        error: "Invalid course ID."
      });
    }

    if (!isValidObjectId(facultyId)) {
      return res.status(400).json({
        error: "Invalid faculty ID."
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        error: "Course not found."
      });
    }

    const facultyMember = await Faculty.findById(facultyId);

    if (!facultyMember) {
      return res.status(404).json({
        error: "Faculty member not found."
      });
    }

    const existingSection = await Section.findOne({
      sectionNumber,
      courseId,
      semester,
      year
    });

    if (existingSection) {
      return res.status(409).json({
        error:
          "This course section already exists for the selected semester and year."
      });
    }

    const section = await Section.create({
      sectionNumber,
      courseId,
      facultyId,
      semester,
      year,
      room
    });

    const populatedSection = await Section.findById(section._id)
      .populate("courseId", "courseCode courseName department credits")
      .populate("facultyId", "firstName lastName email department")
      .lean();

    return res.status(201).json(populatedSection);
  } catch (error) {
    return res.status(422).json({
      error: "Failed to create section.",
      details: error.message
    });
  }
});

// READ all sections
router.get("/", async (req, res) => {
  try {
    const sections = await Section.find()
      .populate("courseId", "courseCode courseName department credits")
      .populate("facultyId", "firstName lastName email department")
      .sort({ year: -1, semester: 1, sectionNumber: 1 })
      .lean();

    return res.status(200).json(sections);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to retrieve sections.",
      details: error.message
    });
  }
});

// READ one section
router.get("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid section ID."
      });
    }

    const section = await Section.findById(req.params.id)
      .populate("courseId", "courseCode courseName department credits")
      .populate("facultyId", "firstName lastName email department")
      .lean();

    if (!section) {
      return res.status(404).json({
        error: "Section not found."
      });
    }

    return res.status(200).json(section);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to retrieve section.",
      details: error.message
    });
  }
});

// UPDATE a section
router.put("/:id", async (req, res) => {
  try {
    const {
      sectionNumber,
      courseId,
      facultyId,
      semester,
      year,
      room
    } = req.body;

    if (
      !sectionNumber ||
      !courseId ||
      !facultyId ||
      !semester ||
      year === undefined ||
      !room
    ) {
      return res.status(400).json({
        error:
          "Section number, course, faculty, semester, year, and room are required."
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid section ID."
      });
    }

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        error: "Invalid course ID."
      });
    }

    if (!isValidObjectId(facultyId)) {
      return res.status(400).json({
        error: "Invalid faculty ID."
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        error: "Course not found."
      });
    }

    const facultyMember = await Faculty.findById(facultyId);

    if (!facultyMember) {
      return res.status(404).json({
        error: "Faculty member not found."
      });
    }

    const duplicateSection = await Section.findOne({
      sectionNumber,
      courseId,
      semester,
      year,
      _id: { $ne: req.params.id }
    });

    if (duplicateSection) {
      return res.status(409).json({
        error:
          "Another matching section already exists for this semester and year."
      });
    }

    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      {
        sectionNumber,
        courseId,
        facultyId,
        semester,
        year,
        room
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate("courseId", "courseCode courseName department credits")
      .populate("facultyId", "firstName lastName email department")
      .lean();

    if (!updatedSection) {
      return res.status(404).json({
        error: "Section not found."
      });
    }

    return res.status(200).json(updatedSection);
  } catch (error) {
    return res.status(422).json({
      error: "Failed to update section.",
      details: error.message
    });
  }
});

// DELETE a section
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid section ID."
      });
    }

    const deletedSection = await Section.findByIdAndDelete(req.params.id);

    if (!deletedSection) {
      return res.status(404).json({
        error: "Section not found."
      });
    }

    return res.status(200).json({
      message: "Section deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete section.",
      details: error.message
    });
  }
});

export default router;