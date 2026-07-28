import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true
    },

    enrollmentDate: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["Enrolled", "Dropped", "Completed"],
      default: "Enrolled"
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Prevent duplicate enrollments
enrollmentSchema.index(
  {
    studentId: 1,
    sectionId: 1
  },
  {
    unique: true
  }
);

export const Enrollment = mongoose.model(
  "Enrollment",
  enrollmentSchema
);