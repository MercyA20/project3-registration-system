import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },

    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Faculty = mongoose.model("Faculty", facultySchema);