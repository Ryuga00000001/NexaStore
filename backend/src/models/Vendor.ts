import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  user: mongoose.Types.ObjectId;
  storeName: string;
  description?: string;
  stripeAccountId?: string;
  isStripeConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    storeName: { type: String, required: true, unique: true },
    description: { type: String },
    stripeAccountId: { type: String },
    isStripeConnected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IVendor>('Vendor', VendorSchema);
