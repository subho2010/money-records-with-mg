import mongoose from "mongoose"

const DueRecordSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  customerContact: {
    type: String,
    required: true,
  },
  customerCountryCode: {
    type: String,
    default: "+91",
  },
  productOrdered: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  amountDue: {
    type: Number,
    required: true,
  },
  expectedPaymentDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

export default mongoose.models.DueRecord || mongoose.model("DueRecord", DueRecordSchema)
