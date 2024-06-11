// src/app/api/payment/route.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { MidtransClient } from 'midtrans-node-client';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

let counter = 1; // Move counter outside the handler to persist across requests

export const POST = async (req: Request) => {
    // Initialize Midtrans client
    const snap = new MidtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY!,
        clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    // Validate and sanitize input data
    const { userid, courseid, gross_amount } = await req.json();
    

    if (!userid || !courseid || !gross_amount) {
        return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Create transaction payload
    const transaction = {
        transaction_details: {
            order_id: 'order-id-' + counter + '-' + Date.now(),
            gross_amount: parseInt(gross_amount, 10), // Ensure gross_amount is a number
        },
        credit_card: {
            secure: true,
        },
        customer_details: {
            userid: userid,
            courseId: courseid,
        },
    };
    counter++;

    // Create transaction token
    try {
        // push ke tabel transaction
        await db.transaction.create({
            data: {
                id: transaction.transaction_details.order_id,
                price: transaction.transaction_details.gross_amount,
                user: {
                    connect: {
                        id: transaction.customer_details.userid,
                    },
                },
            },
        });
        const transactionToken = await snap.createTransactionToken(transaction);
        return new NextResponse(JSON.stringify({ token: transactionToken }), { status: 200 });
    } catch (error) {
        console.error('Midtrans transaction error:', error);
        return new NextResponse(JSON.stringify({ error: 'Error creating transaction' }), { status: 500 });
    }
};
