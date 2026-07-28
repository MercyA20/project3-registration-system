import { Router } from "express";
import mongoose from "mongoose";

import { Enrollment } from "../models/Enrollment.js";
import { Student } from "../models/Student.js";
import { Section } from "../models/Section.js";

const router = Router();

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// CREATE
router.post("/", async (req, res) => {
  try {

    const {
      studentId,
      sectionId,
      status
    } = req.body;

    if (!studentId || !sectionId) {
      return res.status(400).json({
        error: "Student and Section are required."
      });
    }

    if (!validId(studentId) || !validId(sectionId)) {
      return res.status(400).json({
        error: "Invalid ObjectId."
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        error: "Student not found."
      });
    }

    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        error: "Section not found."
      });
    }

    const exists = await Enrollment.findOne({
      studentId,
      sectionId
    });

    if (exists) {
      return res.status(409).json({
        error: "Student already enrolled."
      });
    }

    const enrollment = await Enrollment.create({
      studentId,
      sectionId,
      status
    });

    const result = await Enrollment.findById(enrollment._id)
      .populate("studentId")
      .populate({
        path: "sectionId",
        populate: [
          {
            path: "courseId"
          },
          {
            path: "facultyId"
          }
        ]
      });

    res.status(201).json(result);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
});

// READ ALL
router.get("/", async (req, res) => {

  const enrollments = await Enrollment.find()
    .populate("studentId")
    .populate({
      path: "sectionId",
      populate: [
        {
          path: "courseId"
        },
        {
          path: "facultyId"
        }
      ]
    });

  res.json(enrollments);

});

// READ ONE
router.get("/:id", async (req, res) => {

  if (!validId(req.params.id)) {
    return res.status(400).json({
      error: "Invalid id."
    });
  }

  const enrollment = await Enrollment.findById(req.params.id)
    .populate("studentId")
    .populate({
      path: "sectionId",
      populate: [
        {
          path: "courseId"
        },
        {
          path: "facultyId"
        }
      ]
    });

  if (!enrollment) {
    return res.status(404).json({
      error: "Enrollment not found."
    });
  }

  res.json(enrollment);

});

// UPDATE
router.put("/:id", async (req, res) => {

  const updated = await Enrollment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )
    .populate("studentId")
    .populate({
      path: "sectionId",
      populate: [
        {
          path: "courseId"
        },
        {
          path: "facultyId"
        }
      ]
    });

  res.json(updated);

});

// DELETE
router.delete("/:id", async (req, res) => {

  await Enrollment.findByIdAndDelete(req.params.id);

  res.json({
    message: "Enrollment deleted successfully."
  });

});

export default router;