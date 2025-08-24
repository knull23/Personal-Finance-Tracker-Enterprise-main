// lib/models/Transaction.ts
import mongoose from 'mongoose'

export interface ITransaction {
  _id?: string
  userId?: string
  amount: number
  category: string
  description: string
  date: Date
  type: 'income' | 'expense'
  createdAt?: Date
  updatedAt?: Date
}

const TransactionSchema = new mongoose.Schema<ITransaction>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
}, {
  timestamps: true,
})

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema)
