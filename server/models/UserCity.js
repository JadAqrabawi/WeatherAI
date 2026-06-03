import mongoose from 'mongoose';

const userCitySchema = new mongoose.Schema(
  {
    cityName: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    region: {
      type: String,
      trim: true,
      default: '',
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

userCitySchema.index({ lat: 1, lon: 1 }, { unique: true });

export default mongoose.model('UserCity', userCitySchema);
