import mongoose from "mongoose";

const ChatbotRuleSchema = new mongoose.Schema(
  {
    keywords: {
      type: [String],
      required: [true, "Keywords are required"],
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every(
            (keyword) =>
              typeof keyword === "string" &&
              keyword.trim().length > 0
          ),
        message: "At least one valid keyword is required",
      },
      set: (value) =>
        Array.isArray(value)
          ? value
              .map((keyword) => String(keyword).trim().toLowerCase())
              .filter(Boolean)
          : value,
    },

    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "chatbot_rules",
  }
);

const ChatbotRule =
  mongoose.models.ChatbotRule ||
  mongoose.model("ChatbotRule", ChatbotRuleSchema);

export default ChatbotRule;
