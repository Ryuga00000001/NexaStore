import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  vendor: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
