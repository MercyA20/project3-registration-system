import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: 20
    },

    courseName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Course = mongoose.model("Course", courseSchema);