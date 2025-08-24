// app/api/budgets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db('finance-tracker');

    const budgets = await db
      .collection('budgets')
      .find({ userId: user.uid })
      .sort({ createdAt: -1 })
      .toArray();

    // convert _id to string for client
    const mapped = budgets.map((b: any) => ({ ...b, _id: String(b._id) }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await clientPromise;
    const db = client.db('finance-tracker');

    const body = await request.json();
    const { category, limit, spent = 0, period } = body;

    if (!category || !limit || !period) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedLimit = parseFloat(limit);
    const parsedSpent = parseFloat(spent);

    if (isNaN(parsedLimit) || isNaN(parsedSpent)) {
      return NextResponse.json({ error: 'Invalid number for limit or spent' }, { status: 400 });
    }

    const budget = {
      userId: user.uid,
      category,
      limit: parsedLimit,
      spent: parsedSpent,
      period,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('budgets').insertOne(budget);

    const newBudget = {
      _id: result.insertedId.toString(),
      ...budget,
    };

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}
