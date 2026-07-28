import { Router } from "express";
import { Faculty } from "../models/Faculty.js";

const router = Router();

// CREATE a faculty member
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, department } = req.body;

    if (!firstName || !lastName || !email || !department) {
      return res.status(400).json({
        error:
          "First name, last name, email, and department are required."
      });
    }

    const existingFaculty = await Faculty.findOne({
      email: email.toLowerCase()
    });

    if (existingFaculty) {
      return res.status(409).json({
        error: "A faculty member with this email already exists."
      });
    }

    const facultyMember = await Faculty.create({
      firstName,
      lastName,
      email,
      department
    });

    return res.status(201).json(facultyMember);
  } catch (error) {
    return res.status(422).json({
      error: "Failed to create faculty member.",
      details: error.message
    });
  }
});

// READ all faculty members
router.get("/", async (req, res) => {
  try {
    const faculty = await Faculty.find()
      .sort({ lastName: 1, firstName: 1 })
      .lean();

    return res.status(200).json(faculty);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to retrieve faculty members.",
      details: error.message
    });
  }
});

// READ one faculty member
router.get("/:id", async (req, res) => {
  try {
    const facultyMember = await Faculty.findById(
      req.params.id
    ).lean();

    if (!facultyMember) {
      return res.status(404).json({
        error: "Faculty member not found."
      });
    }

    return res.status(200).json(facultyMember);
  } catch {
    return res.status(400).json({
      error: "Invalid faculty ID."
    });
  }
});

// UPDATE a faculty member
router.put("/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, department } = req.body;

    if (!firstName || !lastName || !email || !department) {
      return res.status(400).json({
        error:
          "First name, last name, email, and department are required."
      });
    }

    const duplicateEmail = await Faculty.findOne({
      email: email.toLowerCase(),
      _id: { $ne: req.params.id }
    });

    if (duplicateEmail) {
      return res.status(409).json({
        error: "Another faculty member already uses this email."
      });
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        department
      },
      {
        new: true,
        runValidators: true
      }
    ).lean();

    if (!updatedFaculty) {
      return res.status(404).json({
        error: "Faculty member not found."
      });
    }

    return res.status(200).json(updatedFaculty);
  } catch (error) {
    return res.status(422).json({
      error: "Failed to update faculty member.",
      details: error.message
    });
  }
});

// DELETE a faculty member
router.delete("/:id", async (req, res) => {
  try {
    const deletedFaculty = await Faculty.findByIdAndDelete(
      req.params.id
    );

    if (!deletedFaculty) {
      return res.status(404).json({
        error: "Faculty member not found."
      });
    }

    return res.status(200).json({
      message: "Faculty member deleted successfully."
    });
  } catch {
    return res.status(400).json({
      error: "Invalid faculty ID."
    });
  }
});

export default router;