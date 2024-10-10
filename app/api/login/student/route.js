import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore/lite';
import { generateToken } from '@/config/Authentication';

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    // Query Firestore for a student with matching matric number or email
    const studentsRef = collection(db, 'students');
    let studentQuery = query(studentsRef, where('matricNumber', '==', identifier));
    let snapshot = await getDocs(studentQuery);

    if (snapshot.empty) {
      console.log('No student found with matricNumber:', identifier);
      // If not found by matric number, try email
      studentQuery = query(studentsRef, where('email', '==', identifier));
      snapshot = await getDocs(studentQuery);
      
      if (snapshot.empty) {
        console.log('No student found with email:', identifier);
      } else {
        console.log('Student found with email:', identifier);
      }
    } else {
      console.log('Student found with matricNumber:', identifier);
    }

    if (snapshot.empty) {
      return NextResponse.json({ message: 'Invalid credentials (User not found)' }, { status: 401 });
    }

    const studentDoc = snapshot.docs[0];
    const student = { id: studentDoc.id, ...studentDoc.data() };
    // console.log('Retrieved student data:', JSON.stringify({ ...student, password: '[REDACTED]' }, null, 2));

    // Directly compare passwords
    if (password !== student.password) {
      console.log('Password mismatch');
      return NextResponse.json({ message: 'Invalid credentials (Password mismatch)' }, { status: 401 });
    }

    console.log('Password match');

    // Generate token
    const token = await generateToken(student);

    console.log('Login successful for:', identifier);
    //return NextResponse.json({ token });

    console.log('Generated token:', token); // For debugging
    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}