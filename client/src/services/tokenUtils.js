import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;  // Current time in seconds

    // If the token has expired, return true
    return decoded.exp < currentTime;
  } catch (e) {
    return true;  // Token is invalid if an error occurs during decoding
  }
};
