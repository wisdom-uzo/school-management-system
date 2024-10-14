import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Cookies from 'js-cookie';
import * as jose from "jose";

const SECRET_KEY = new TextEncoder().encode(
    "Swe4g7c?UBm5Nrd96vhsVDtkyJFbqKMTm!TMw5BDRLtaCFAXNvbq?s4rGKQSZnUP"
  );

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = async (student) => {
    return await new jose.SignJWT({ id: student.id, email: student.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(SECRET_KEY);
  };

//   export const generateToken = async (student) => {
//     const accessToken = await new jose.SignJWT({ id: student.id, email: student.email })
//       .setProtectedHeader({ alg: 'HS256' })
//       .setExpirationTime('15m') // Access token valid for 15 minutes
//       .sign(SECRET_KEY);
  
//     const refreshToken = await new jose.SignJWT({ id: student.id, email: student.email })
//       .setProtectedHeader({ alg: 'HS256' })
//       .setExpirationTime('7d') // Refresh token valid for 7 days
//       .sign(SECRET_KEY);
  
//     return { accessToken, refreshToken };
//   };

export const verifyToken = async (token) => {
    try {
      const { payload } = await jose.jwtVerify(token, SECRET_KEY);
      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  };

const isServer = typeof window === 'undefined';

export const removeToken = async () => {
  if (isServer) {
    // Server-side
    const { cookies } = await import('next/headers');
    cookies().delete('authToken');
    console.log('Token removed on server');
  } else {
    // Client-side
    Cookies.remove('authToken');
    console.log('Token removed on client');
  }
};

export const getToken = async () => {
  let token;
  if (isServer) {
    // Server-side
    const { cookies } = await import('next/headers');
    token = cookies().get('authToken')?.value;
    console.log('Retrieved token on server:', token);
  } else {
    // Client-side
    token = Cookies.get('authToken');
    console.log('Retrieved token on client:', token);
  }
  return token;
};

// export const setToken = (token) => {
//     if (isServer) {
//       // Server-side token setting should be done in an API route or server action
//       console.warn('Attempting to set token on server-side. This should be done in an API route.');
//     } else {
//       Cookies.set('authToken', token, { 
//         expires: 1, // expires in 1 day
//         secure: true, // only send cookie over HTTPS
//         sameSite: 'Strict', // helps prevent CSRF
//         httpOnly: true // restricts access from JavaScript
//       });
//       console.log('Token set on client:', token);
//     }
//   };

export const setToken = (token) => {
  if (isServer) {
    // Server-side token setting should be done in an API route or server action
    console.warn('Attempting to set token on server-side. This should be done in an API route.');
  } else {
    // Client-side
    Cookies.set('authToken', token, { expires: 1 }); // expires in 1 day
    console.log('Token set on client:', token);
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  const decodedToken = verifyToken(token);
  return !!decodedToken;
};

export const getUserType = () => {
  const token = getToken();
  if (!token) return null;
  const decodedToken = verifyToken(token);
  return decodedToken ? decodedToken.userType : null;
};