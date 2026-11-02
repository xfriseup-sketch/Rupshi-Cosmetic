import mongoose from "mongoose";

const SiteSettingsSchema = new mongoose.Schema(
  {
    // Global singleton document
    key: {
      type: String,
      default: "global",
      unique: true,
    },

    // Dynamic Support Widget settings
    whatsappNumber: {
      type: String,
      default: "",
      trim: true,
    },
    facebookPageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    supportEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Existing notice bar settings
    noticeBar: {
      text: {
        type: String,
        default: "✨ Free Express Delivery on orders over ৳1,999! Code: GLOW2026 ✨",
      },
      isActive: { type: Boolean, default: true },
      bgColor: { type: String, default: "#e11d48" },
    },

    heroSection: {
      isVisible: { type: Boolean, default: true },
    },

    promotionalBanner: {
      title: { type: String, default: "নতুন কালেকশন এখন লাইভ" },
      subtitle: {
        type: String,
        default: "Beauty, Fashion ও Tech — এক জায়গায় বেছে নিন।",
      },
      buttonText: { type: String, default: "শপ করুন" },
      buttonLink: { type: String, default: "/shop" },
      imageUrl: { type: String, default: "" },
      isActive: { type: Boolean, default: true },
    },

    categoriesSection: {
      isVisible: { type: Boolean, default: true },
      maxItems: { type: Number, default: 4, min: 1, max: 12 },
    },

    bestSellersSection: {
      isVisible: { type: Boolean, default: true },
      maxItems: { type: Number, default: 4, min: 1, max: 12 },
    },

    hotOffersSection: {
      isVisible: { type: Boolean, default: true },
      maxItems: { type: Number, default: 3, min: 1, max: 12 },
    },

    fashionSection: {
      isVisible: { type: Boolean, default: true },
      maxItems: { type: Number, default: 4, min: 1, max: 12 },
    },

    techSection: {
      isVisible: { type: Boolean, default: true },
      maxItems: { type: Number, default: 4, min: 1, max: 12 },
    },

    promoBanner: {
      title: { type: String, default: "Get Up to 35% OFF" },
      subtitle: {
        type: String,
        default:
          "Limited-time luxury deals on premium skincare & makeup. Glow starts now.",
      },
      buttonText: { type: String, default: "Claim Deal Now" },
      buttonLink: {
        type: String,
        default: "/shop?hotOffer=true",
      },
      imageUrl: { type: String, default: "" },
      couponCode: { type: String, default: "" },
      isActive: { type: Boolean, default: true },
    },

    newArrivalsSection: {
      isVisible: { type: Boolean, default: true },
      maxItems: { type: Number, default: 4, min: 1, max: 12 },
    },

    reviewsSection: {
      isVisible: { type: Boolean, default: true },
    },

    whyChooseUsSection: {
      isVisible: { type: Boolean, default: true },
    },
  },
  {
    collection: "site_settings",
    timestamps: true,
  }
);

const SiteSettings =
  mongoose.models.SiteSettings ||
  mongoose.model("SiteSettings", SiteSettingsSchema);

/**
 * Existing homepage defaults.
 */
export const DEFAULT_SETTINGS = {
  noticeBar: {
    text: "✨ Free Express Delivery on orders over ৳1,999! Code: GLOW2026 ✨",
    isActive: true,
    bgColor: "#e11d48",
  },
  heroSection: { isVisible: true },
  promotionalBanner: {
    title: "নতুন কালেকশন এখন লাইভ",
    subtitle: "Beauty, Fashion ও Tech — এক জায়গায় বেছে নিন।",
    buttonText: "শপ করুন",
    buttonLink: "/shop",
    imageUrl: "",
    isActive: true,
  },
  categoriesSection: { isVisible: true, maxItems: 4 },
  bestSellersSection: { isVisible: true, maxItems: 4 },
  hotOffersSection: { isVisible: true, maxItems: 3 },
  fashionSection: { isVisible: true, maxItems: 4 },
  techSection: { isVisible: true, maxItems: 4 },
  promoBanner: {
    title: "Get Up to 35% OFF",
    subtitle:
      "Limited-time luxury deals on premium skincare & makeup. Glow starts now.",
    buttonText: "Claim Deal Now",
    buttonLink: "/shop?hotOffer=true",
    imageUrl: "",
    couponCode: "",
    isActive: true,
  },
  newArrivalsSection: { isVisible: true, maxItems: 4 },
  reviewsSection: { isVisible: true },
  whyChooseUsSection: { isVisible: true },
};

export default SiteSettings;
