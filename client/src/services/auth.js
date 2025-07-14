
import { jwtDecode } from 'jwt-decode';  // Import jwt-decode
import api from './api';

export const login = async (username, password) => {
  try {
    const response = await api.post('/users/login', {
      username,
      password
    });

    const { token } = response.data;  // Get token from response

    // Decode the token to extract the user data
    const decoded = jwtDecode(token);

    // You can store decoded user data (e.g., role, id) along with the token
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(decoded));  // Store decoded user data in local storage

    return decoded;  // Return decoded user data (it contains role, id, etc.)
  } catch (error) {
    throw new Error('Invalid username or password');
  }
};
