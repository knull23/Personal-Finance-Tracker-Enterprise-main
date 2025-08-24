// app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db('finance-tracker');

    const transaction = await db.collection('transactions').findOne({
      _id: new ObjectId(params.id),
      userId: user.uid,
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const result = await db.collection('transactions').deleteOne({
      _id: new ObjectId(params.id),
      userId: user.uid,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // If it was an expense, update the related budget (user-scoped)
    if (transaction.type === 'expense' && transaction.category) {
      const budget = await db.collection('budgets').findOne({
        category: transaction.category,
        userId: user.uid,
      });

      if (budget) {
        await db.collection('budgets').updateOne(
          { _id: budget._id },
          {
            $inc: { spent: -transaction.amount },
            $set: { updatedAt: new Date() },
          }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}

