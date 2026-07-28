import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    sectionNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true
    },

    semester: {
      type: String,
      required: true,
      trim: true,
      enum: ["Winter", "Spring", "Summer", "Fall"]
    },

    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100
    },

    room: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

sectionSchema.index(
  {
    courseId: 1,
    sectionNumber: 1,
    semester: 1,
    year: 1
  },
  {
    unique: true
  }
);

export const Section = mongoose.model("Section", sectionSchema);