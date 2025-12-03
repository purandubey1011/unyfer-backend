const mongoose = require("mongoose");

const ApplyFormSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, "Please enter a valid phone number"],
    },
    followers: {
      type: Number,
      required: true,
      min: 0,
    },
    isCreator: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApplyForm", ApplyFormSchema);
