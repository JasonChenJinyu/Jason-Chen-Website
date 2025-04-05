import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/authOptions';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Define the base directory where files are shared on the Mac Mini
// This should be a directory that's set up for file sharing
const BASE_DIRECTORY = process.env.SHARED_DIRECTORY || '/Users/jasonchen';

// Validate that a path is within the allowed base directory
function validatePath(requestedPath: string): string {
  // Normalize and resolve the full path
  const fullPath = path.resolve(path.join(BASE_DIRECTORY, requestedPath));
  
  // Check if the path is within the base directory
  if (!fullPath.startsWith(BASE_DIRECTORY)) {
    throw new Error('Path traversal attack detected');
  }
  
  return fullPath;
}

// List files in a directory
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let requestedPath = searchParams.get('path') || '/';
    
    // Remove any leading slash for path joining
    if (requestedPath.startsWith('/')) {
      requestedPath = requestedPath.slice(1);
    }
    
    try {
      const fullPath = validatePath(requestedPath);
      
      // Enhanced debugging - log the paths
      console.log('BASE_DIRECTORY:', BASE_DIRECTORY);
      console.log('Requested path:', requestedPath);
      console.log('Full path to access:', fullPath);
      
      // First check if the directory exists
      try {
        const stats = await fs.stat(fullPath);
        
        if (!stats.isDirectory()) {
          return NextResponse.json(
            { message: 'Not a directory' },
            { status: 400 }
          );
        }
      } catch (statError) {
        console.error('Error checking path stats:', statError);
        return NextResponse.json(
          { message: `Directory not accessible: ${statError instanceof Error ? statError.message : String(statError)}` },
          { status: 404 }
        );
      }
      
      // Read the directory contents
      let files;
      try {
        files = await fs.readdir(fullPath);
      } catch (readError) {
        console.error('Error reading directory:', readError);
        return NextResponse.json(
          { message: `Cannot read directory: ${readError instanceof Error ? readError.message : String(readError)}` },
          { status: 403 }
        );
      }
      
      // Get file details
      try {
        const fileDetails = await Promise.all(
          files.map(async (file) => {
            try {
              const filePath = path.join(fullPath, file);
              const stats = await fs.stat(filePath);
              
              return {
                name: file,
                path: path.join('/', requestedPath, file).replace(/\\/g, '/'),
                isDirectory: stats.isDirectory(),
                size: stats.size,
                modifiedTime: stats.mtime.toISOString()
              };
            } catch (fileError) {
              console.error(`Error getting details for file ${file}:`, fileError);
              return {
                name: file,
                path: path.join('/', requestedPath, file).replace(/\\/g, '/'),
                isDirectory: false,
                size: 0,
                modifiedTime: new Date().toISOString(),
                error: 'Could not read file information'
              };
            }
          })
        );
        
        return NextResponse.json(fileDetails);
      } catch (detailsError) {
        console.error('Error getting file details:', detailsError);
        return NextResponse.json(
          { message: `Error processing file details: ${detailsError instanceof Error ? detailsError.message : String(detailsError)}` },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error accessing path:', error);
      return NextResponse.json(
        { message: `Invalid path or directory not found: ${error instanceof Error ? error.message : String(error)}` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { message: `Internal Server Error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// Download a file
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    let { filePath } = body;
    
    if (!filePath) {
      return NextResponse.json(
        { message: 'File path is required' },
        { status: 400 }
      );
    }
    
    // Remove any leading slash for path joining
    if (filePath.startsWith('/')) {
      filePath = filePath.slice(1);
    }
    
    try {
      const fullPath = validatePath(filePath);
      
      // Check if the file exists and is not a directory
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        return NextResponse.json(
          { message: 'Cannot download a directory' },
          { status: 400 }
        );
      }
      
      // Read the file
      const fileBuffer = await fs.readFile(fullPath);
      
      // Get filename and properly encode it for Content-Disposition
      const filename = path.basename(fullPath);
      const encodedFilename = encodeURIComponent(filename)
        .replace(/['"()]/g, escape) // Escape special characters
        .replace(/\*/g, '%2A'); // Replace * with %2A
      
      // Send the file as a response
      const response = new NextResponse(fileBuffer);
      
      // Set proper Content-Disposition header
      response.headers.set(
        'Content-Disposition', 
        `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`
      );
      response.headers.set('Content-Type', 'application/octet-stream');
      
      return response;
    } catch (error) {
      console.error('Error accessing file:', error);
      return NextResponse.json(
        { message: `File not found or access denied: ${error instanceof Error ? error.message : String(error)}` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 