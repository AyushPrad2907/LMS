const mongoose = require("mongoose");

const trialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid mobile number"],
    },

    whatsapp: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid WhatsApp number"],
    },

    class: {
      type: String,
      required: true,
      enum: ["5", "6", "7", "8", "9", "10"],
    },

    medium: {
      type: String,
      required: true,
      enum: ["Hindi", "English"],
    },

    status: {
      type: String,
      enum: ["Pending", "Contacted", "Converted"],
      default: "Pending",
    },

    remarks: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trial", trialSchema);