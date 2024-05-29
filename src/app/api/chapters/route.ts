import { currentRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Define the shape of the request body
interface ChapterDetails {
    title: string;
    summary: string;
}

const POST = async (req: Request): Promise<Response> => {
    try {
        const role = await currentRole();

        if (role !== "ADMIN") {
            return new NextResponse(null, { status: 403 });
        }

        // get course id from query params
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return new NextResponse(JSON.stringify({ error: 'Course ID is required' }), { status: 400 });
        }

        const { title, summary }: ChapterDetails = await req.json();

        const chapter = await db.chapters.create({
            data: {
                title,
                summary,
                course: { connect: { id: courseId } },
            },
        });

        return new NextResponse(JSON.stringify({ message: 'Post created successfully', chapter }), { status: 201 });

    } catch (error: any) {
        console.error('Error creating post:', error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

const GET = async (req: Request): Promise<Response> => {
    try {
        const role = await currentRole();

        if (role == null) {
            return new NextResponse(null, { status: 403 });
        }
        
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            // return new NextResponse(JSON.stringify({ error: 'Course ID is required' }), { status: 400 });
            // return all
            const chapters = await db.chapters.findMany();
            return new NextResponse(JSON.stringify(chapters), { status: 200 });
        }

        const chapter = await db.chapters.findUnique({ where: { id } });

        if (!chapter) {
            return new NextResponse(JSON.stringify({ error: 'Chapter Details not found' }), { status: 404 });
        }

        return new NextResponse(JSON.stringify(chapter), { status: 200 });
    } catch (error: any) {
        console.error('Error retrieving post:', error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

const PUT = async (req: Request): Promise<Response> => {
    try {
        const role = await currentRole();

        if (role !== "ADMIN") {
            return new NextResponse(null, { status: 403 });
        }

        const { id, title, summary }: ChapterDetails & { id: string } = await req.json();

        if (!id) {
            return new NextResponse(JSON.stringify({ error: 'Chapter ID is required' }), { status: 400 });
        }

        const updatedCourse = await db.chapters.update({
            where: { id },
            data: { title, summary },
        });

        return new NextResponse(JSON.stringify({ message: 'Post updated successfully', course: updatedCourse }), { status: 200 });
    } catch (error: any) {
        console.error('Error updating post:', error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

const DELETE = async (req: Request): Promise<Response> => {
    try {
        const role = await currentRole();

        if (role !== "ADMIN") {
            return new NextResponse(null, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return new NextResponse(JSON.stringify({ error: 'Chapter ID is required' }), { status: 400 });
        }

        await db.chapters.delete({ where: { id } });

        return new NextResponse(JSON.stringify({ message: 'Post deleted successfully' }), { status: 200 });
    } catch (error: any) {
        console.error('Error deleting post:', error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export { POST, GET, PUT, DELETE };
