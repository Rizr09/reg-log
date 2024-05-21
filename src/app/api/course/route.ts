import { currentRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Define the shape of the request body
interface CourseDetails {
    title: string;
    description: string;
    slug: string;
    image: string;
}

const POST = async (req: Request): Promise<Response> => {
    try {
        const role = await currentRole();

        if (role !== "ADMIN") {
            return new NextResponse(null, { status: 403 });
        }

        const courseDetails: CourseDetails = await req.json();

        // Save post details to database
        await db.course.create({ data: courseDetails });

        return new NextResponse(JSON.stringify({ message: 'Post created successfully' }), { status: 201 });
    } catch (error: any) {
        console.error('Error creating post:', error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

const GET = async (req: Request): Promise<Response> => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            // return new NextResponse(JSON.stringify({ error: 'Course ID is required' }), { status: 400 });
            // return all
            const courses = await db.course.findMany();
            return new NextResponse(JSON.stringify(courses), { status: 200 });
        }

        const course = await db.course.findUnique({ where: { id } });

        if (!course) {
            return new NextResponse(JSON.stringify({ error: 'Course not found' }), { status: 404 });
        }

        return new NextResponse(JSON.stringify(course), { status: 200 });
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

        const { id, title, description, slug, image }: CourseDetails & { id: string } = await req.json();

        const updatedCourse = await db.course.update({
            where: { id },
            data: { title, description, slug, image },
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
            return new NextResponse(JSON.stringify({ error: 'Course ID is required' }), { status: 400 });
        }

        await db.course.delete({ where: { id } });

        return new NextResponse(JSON.stringify({ message: 'Post deleted successfully' }), { status: 200 });
    } catch (error: any) {
        console.error('Error deleting post:', error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export { POST, GET, PUT, DELETE };