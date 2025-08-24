// app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db('finance-tracker');

    const transactions = await db
      .collection('transactions')
      .find({ userId: user.uid })
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(transactions.map((t: any) => ({ ...t, _id: String(t._id) })));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db('finance-tracker');

    const body = await request.json();
    const { amount, category, description, type, date } = body ?? {};

    if (!amount || !category || !type || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const transaction = {
      userId: user.uid,
      amount: parsedAmount,
      category,
      description: description || '',
      type,
      date: new Date(date),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('transactions').insertOne(transaction);

    // If expense, update budget for this user
    if (type === 'expense' && category) {
      const budget = await db.collection('budgets').findOne({ category, userId: user.uid });

      if (budget) {
        await db.collection('budgets').updateOne(
          { _id: budget._id },
          {
            $inc: { spent: parsedAmount },
            $set: { updatedAt: new Date() },
          }
        );
      }
    }

    const newTransaction = {
      _id: result.insertedId.toString(),
      ...transaction,
    };

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
