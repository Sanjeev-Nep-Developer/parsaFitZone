import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  joiningDate: { type: Date, required: true },
  lastPaidDate: { type: Date, required: true },
  membershipExpiryDate: { type: Date, required: true },
  dueAmount: { type: Number, default: 0 },
  paymentDone: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Member', MemberSchema);
