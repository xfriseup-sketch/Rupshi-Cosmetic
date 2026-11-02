import mongoose from 'mongoose';

/**
 * @typedef {Object} ISiteSettings
 * @property {string} whatsappNumber
 * @property {string} facebookPageUrl
 * @property {string} supportEmail
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const SiteSettingsSchema = new mongoose.Schema(
  {
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
    },
    facebookPageUrl: {
      type: String,
      required: [true, 'Facebook page URL is required'],
      trim: true,
    },
    supportEmail: {
      type: String,
      required: [true, 'Support email is required'],
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Singleton pattern to prevent re-compilation errors during hot-reloading in dev mode
const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
