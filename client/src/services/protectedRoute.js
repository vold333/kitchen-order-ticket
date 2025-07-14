
import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode

const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token); // Decode the token to get user info
    const currentTime = Date.now() / 1000; // Current time in seconds

    // Check if token is expired
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/login" />;
    }

    // Check if the user's role is allowed to access this route
    if (!allowedRoles.includes(decoded.role.toLowerCase())) {
      return <Navigate to="/unauthorized" />;
    }

    return element; // Return the element if authorized
  } catch (error) {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
