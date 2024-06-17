import { currentRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Transaction {
    user_id: string;
    course_id: string;
    status: string;
}

const GET = async (req: Request): Promise<Response> => {
    try {
        const role = await currentRole();

        if (role == null) {
            return new NextResponse(null, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const course_id = searchParams.get('course_id');

        if (!id) {
            return new NextResponse(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
        }

        if (!course_id) {
            return new NextResponse(JSON.stringify({ error: 'Course ID is required' }), { status: 400 });
        }

        // cek apakah user_id dan course_id ada di transaction dan DONE, return typenya boolean
        const transaction = await db.transaction.findFirst({
            where: {
                userId: id,
                courseId: course_id,
                status: "DONE"
            }
        });
        

        if (!transaction) {
            return new NextResponse(JSON.stringify({ isPaid: false }), { status: 200 });
        }

        return new NextResponse(JSON.stringify({ isPaid: true }), { status: 200 });
    } catch (error: any) {
        console.error('Error retrieving course:', error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export { GET };