import { Router } from "express";
import { Student } from "../models/Student.js";

const router = Router();

// CREATE a new student
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, major } = req.body;

    if (!firstName || !lastName || !email || !major) {
      return res.status(400).json({
        error: "First name, last name, email, and major are required."
      });
    }

    const existingStudent = await Student.findOne({
      email: email.toLowerCase()
    });

    if (existingStudent) {
      return res.status(409).json({
        error: "A student with this email already exists."
      });
    }

    const student = await Student.create({
      firstName,
      lastName,
      email,
      major
    });

    return res.status(201).json(student);
  } catch (error) {
    return res.status(422).json({
      error: "Failed to create student.",
      details: error.message
    });
  }
});

// READ all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find()
      .sort({ lastName: 1, firstName: 1 })
      .lean();

    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to retrieve students.",
      details: error.message
    });
  }
});

// READ one student
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();

    if (!student) {
      return res.status(404).json({
        error: "Student not found."
      });
    }

    return res.status(200).json(student);
  } catch {
    return res.status(400).json({
      error: "Invalid student ID."
    });
  }
});

// UPDATE a student
router.put("/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, major } = req.body;

    if (!firstName || !lastName || !email || !major) {
      return res.status(400).json({
        error: "First name, last name, email, and major are required."
      });
    }

    const duplicateEmail = await Student.findOne({
      email: email.toLowerCase(),
      _id: { $ne: req.params.id }
    });

    if (duplicateEmail) {
      return res.status(409).json({
        error: "Another student already uses this email."
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        major
      },
      {
        new: true,
        runValidators: true
      }
    ).lean();

    if (!updatedStudent) {
      return res.status(404).json({
        error: "Student not found."
      });
    }

    return res.status(200).json(updatedStudent);
  } catch (error) {
    return res.status(422).json({
      error: "Failed to update student.",
      details: error.message
    });
  }
});

// DELETE a student
router.delete("/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({
        error: "Student not found."
      });
    }

    return res.status(200).json({
      message: "Student deleted successfully."
    });
  } catch {
    return res.status(400).json({
      error: "Invalid student ID."
    });
  }
});

export default router;