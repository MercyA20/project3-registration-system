import { Router } from "express";
import { Course } from "../models/Course.js";

const router = Router();

// CREATE a new course
router.post("/", async (req, res) => {
  try {
    const {
      courseCode,
      courseName,
      department,
      credits
    } = req.body;

    if (
      !courseCode ||
      !courseName ||
      !department ||
      credits === undefined
    ) {
      return res.status(400).json({
        error:
          "Course code, course name, department, and credits are required."
      });
    }

    const existingCourse = await Course.findOne({
      courseCode: courseCode.toUpperCase()
    });

    if (existingCourse) {
      return res.status(409).json({
        error: "A course with this course code already exists."
      });
    }

    const newCourse = await Course.create({
      courseCode,
      courseName,
      department,
      credits
    });

    return res.status(201).json(newCourse);
  } catch (error) {
    return res.status(422).json({
      error: "Failed to create course.",
      details: error.message
    });
  }
});

// READ all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ courseCode: 1 })
      .lean();

    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to retrieve courses.",
      details: error.message
    });
  }
});

// READ one course
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();

    if (!course) {
      return res.status(404).json({
        error: "Course not found."
      });
    }

    return res.status(200).json(course);
  } catch {
    return res.status(400).json({
      error: "Invalid course ID."
    });
  }
});

// UPDATE a course
router.put("/:id", async (req, res) => {
  try {
    const {
      courseCode,
      courseName,
      department,
      credits
    } = req.body;

    if (
      !courseCode ||
      !courseName ||
      !department ||
      credits === undefined
    ) {
      return res.status(400).json({
        error:
          "Course code, course name, department, and credits are required."
      });
    }

    const duplicateCourse = await Course.findOne({
      courseCode: courseCode.toUpperCase(),
      _id: { $ne: req.params.id }
    });

    if (duplicateCourse) {
      return res.status(409).json({
        error: "Another course already uses this course code."
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        courseCode,
        courseName,
        department,
        credits
      },
      {
        new: true,
        runValidators: true
      }
    ).lean();

    if (!updatedCourse) {
      return res.status(404).json({
        error: "Course not found."
      });
    }

    return res.status(200).json(updatedCourse);
  } catch (error) {
    return res.status(422).json({
      error: "Failed to update course.",
      details: error.message
    });
  }
});

// DELETE a course
router.delete("/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(
      req.params.id
    );

    if (!deletedCourse) {
      return res.status(404).json({
        error: "Course not found."
      });
    }

    return res.status(200).json({
      message: "Course deleted successfully."
    });
  } catch {
    return res.status(400).json({
      error: "Invalid course ID."
    });
  }
});

export default router;