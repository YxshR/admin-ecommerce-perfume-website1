import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

// POST handler to upload files
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const adminToken = cookies().get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Process the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file details
    const filename = file.name;
    const mimeType = file.type;
    const size = file.size;

    // Create a unique filename to prevent collisions
    const uniqueFilename = `${uuidv4()}-${filename}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'attachments');
    await mkdir(uploadDir, { recursive: true });
    
    // Create the file path
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Convert the file to a buffer and write it to the file system
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Generate the public URL for the file
    const publicUrl = `/uploads/attachments/${uniqueFilename}`;
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      attachment: {
        filename,
        path: filePath,
        publicPath: publicUrl,
        mimeType,
        size,
        url: publicUrl
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 