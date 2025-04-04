import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/authOptions';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    // Check if the user is authenticated as a superuser
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify the requester is a superuser
    const requester = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!requester || requester.role !== 'SUPERUSER') {
      return NextResponse.json(
        { message: 'Forbidden: Superuser access required' },
        { status: 403 }
      );
    }

    // Get the user ID and new role from the request
    const body = await request.json();
    const { userId, newRole } = body;
    
    if (!userId || !newRole) {
      return NextResponse.json(
        { message: 'User ID and new role are required' },
        { status: 400 }
      );
    }
    
    // Valid roles
    const validRoles = ['USER', 'ADMIN', 'SUPERUSER'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 