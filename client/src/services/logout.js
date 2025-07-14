// // services/logout.js
// export const handleLogout = () => {
//     // Remove token and user from local storage
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
  
//     // Prevent back navigation to previous session
//     window.history.pushState(null, null, '/login');
//     window.location.replace('/login'); // Force reload to clear history
//   };

import { useNavigate } from 'react-router-dom';

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Remove token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Reset the browser history to prevent back navigation
    // window.history.pushState(null, null, '/login');
    window.history.replaceState(null, null, "/login");
    
    // Navigate to login and prevent going back
    navigate('/login', { replace: true });

    // Force reload to clear cache
    window.location.reload();
  };

  return logout;
};

export default useLogout;

