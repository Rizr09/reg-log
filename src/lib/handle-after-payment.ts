import { MidtransAfterPaymentProps } from "@/utils/MidtransAfterPaymentProps";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { Status } from '@prisma/client';


const updateTransactionDb = async (props: MidtransAfterPaymentProps, status: Status) => {
    const transactionId = props.order_id;
    try {
        await db.transaction.update({
            where: {
                id: transactionId
            },
            data: {
                status: status,
                date: new Date(Date.now())
            }
        });
        // Buat update db setelah pembayaran berhasil
    } catch (error) {
        console.error('Error updating transaction:', error);
    }
}

const signatureKeyCompare = (signature_key: string, order_id: string, gross_amount: string, status_code: string) => {
    /*
    The logic to generate or calculate signature_key is explained below: SHA512(order_id+status_code+gross_amount+ServerKey)
    */
    
    const userSignatureKey = `${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`;

    const hash = createHash('sha512').update(userSignatureKey).digest('hex'); 
    console.log(hash);
    console.log(signature_key);
    
    return signature_key === hash
}

export const handleAfterPayment = async (response: MidtransAfterPaymentProps) => {
    const transactionStatus = response.transaction_status;
    const fraudStatus = response.fraud_status;
    let data = null;
    const transaction = await db.transaction.findFirst({
        where: {
            id: response.order_id
        }
    });

    if (!transaction?.id || !transaction?.price) {
        return { status: 501, message: 'Transaction not found' };
    }

    const isSignatureFromMidtrans = signatureKeyCompare(response.signature_key, transaction?.id, response.gross_amount,
        response.status_code
    );

    if (isSignatureFromMidtrans) {
        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus == 'accept') {
                data = await updateTransactionDb(response, 'DONE');
            } else return { status: 500, message: 'Fraud detected!' };
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            data = await updateTransactionDb(response, 'CANCELED');
        } else if (transactionStatus === 'pending') {
            data = await updateTransactionDb(response, 'PENDING');
        } else return { status: 500, message: 'no status available' };
    } else return { status: 500, message: 'Signature key not match' };

    return data;
}