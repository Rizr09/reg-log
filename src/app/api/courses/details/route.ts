import { currentRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface CourseDetails {
    title: string;
    description: string;
    slug: string;
    image: string;
}

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

        if (!id) {
            return new NextResponse(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
        }

        // ambil semua course_id untuk status transactionnya DONE berdasarkan user_id
        
        const transaction = await db.transaction.findMany({
            where: {
                userId: id,
                status: "DONE"
            }
        });

        // console.log(transaction);

        // from the transaction, get the distinct course_id
        const courseIds = transaction.map((t) => t.courseId);
        // console.log(courseIds);

        // now, get every course details based on the courseIds, also include the chapters and chapter contents
        const courses = await db.courses.findMany({
            where: {
                id: {
                    in: courseIds
                }
            },
            include: {
                Chapters: {
                    include: {
                        ChapterContents: true
                    }
                }
            }
        });
        

        if (!courses) {
            return new NextResponse(JSON.stringify({ error: 'Course not found' }), { status: 404 });
        }

        return new NextResponse(JSON.stringify(courses), { status: 200 });
    } catch (error: any) {
        console.error('Error retrieving course:', error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export { GET };