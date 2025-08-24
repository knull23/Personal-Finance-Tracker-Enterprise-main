// lib/models/Budgets.ts
import mongoose from 'mongoose'

export interface IBudget {
  _id?: string
  userId?: string
  category: string
  limit: number
  spent: number
  period: 'monthly' | 'yearly'
  createdAt?: Date
  updatedAt?: Date
}

const BudgetSchema = new mongoose.Schema<IBudget>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  spent: {
    type: Number,
    default: 0,
  },
  period: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true,
  },
}, {
  timestamps: true,
})

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema)
