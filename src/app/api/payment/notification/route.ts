import { handleAfterPayment } from "@/lib/handle-after-payment";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();

    try {
        const data = await handleAfterPayment(body);
        console.log(data);
        return NextResponse.json({ status: 201, message: "Transaction Success", data:data });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ status: 500, message: "Transaction Failed" });
    }
}