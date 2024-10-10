
import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore/lite';
import { getToken, verifyToken } from '@/config/Authentication';

export async function GET() {
  try {
    const token = getToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const studentId = decodedToken.id;
    const studentRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentData = studentSnap.data();
    return NextResponse.json(studentData);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
