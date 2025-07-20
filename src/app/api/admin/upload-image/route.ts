import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzzxpyqif',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to get file buffer from FormData
async function getFileBuffer(formData: FormData): Promise<{ buffer: Buffer, filename: string, mimetype: string }> {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file uploaded');
  }
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  return {
    buffer,
    filename: file.name,
    mimetype: file.type
  };
}

// POST handler for image uploads
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const cookieStore = cookies();
    const adminToken = cookieStore.get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the file from the request
    const formData = await request.formData();
    const { buffer, filename, mimetype } = await getFileBuffer(formData);
    
    // Check if we have Cloudinary credentials
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary credentials not configured' },
        { status: 500 }
      );
    }
    
    // Upload to Cloudinary using the signed upload method
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'avito-emails',
          resource_type: 'auto'
        },
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            resolve(
              NextResponse.json(
                { success: false, error: error?.message || 'Upload failed' },
                { status: 500 }
              )
            );
            return;
          }
          
          resolve(
            NextResponse.json(
              { 
                success: true, 
                url: result.secure_url,
                public_id: result.public_id
              },
              { status: 200 }
            )
          );
        }
      );
      
      // Convert buffer to stream and pipe to Cloudinary
      const Readable = require('stream').Readable;
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 