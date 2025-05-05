import mongoose from "mongoose"

const ReceiptItemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  price: Number,
})

const ReceiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerContact: String,
  customerCountryCode: String,
  paymentType: {
    type: String,
    enum: ["cash", "card", "online"],
    required: true,
  },
  notes: String,
  items: [ReceiptItemSchema],
  total: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentDetails: {
    cardNumber: String,
    phoneNumber: String,
    phoneCountryCode: String,
  },
  storeInfo: {
    name: String,
    address: String,
    contact: String,
    countryCode: String,
  },
})

export default mongoose.models.Receipt || mongoose.model("Receipt", ReceiptSchema)
