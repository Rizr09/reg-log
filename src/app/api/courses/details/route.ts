import { currentRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface CourseDetails {
    title: string;
    description: string;
    slug: string;
    image: string;
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
            return new NextResponse(JSON.stringify({ error: 'Course ID is required' }), { status: 400 });
        }

        const course = await db.courses.findUnique({
            where: { id },
            include: {
                Chapters: {
                    include: {
                        ChapterContents: true
                    }
                }
            }
        });

        if (!course) {
            return new NextResponse(JSON.stringify({ error: 'Course not found' }), { status: 404 });
        }

        return new NextResponse(JSON.stringify(course), { status: 200 });
    } catch (error: any) {
        console.error('Error retrieving course:', error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export { GET };