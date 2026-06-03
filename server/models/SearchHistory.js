import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
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
    lat: { type: Number },
    lon: { type: Number },
    searchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

searchHistorySchema.index({ searchedAt: -1 });

export default mongoose.model('SearchHistory', searchHistorySchema);
