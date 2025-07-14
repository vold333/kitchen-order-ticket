// src/App.js

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './services/protectedRoute'; 
import { isTokenExpired } from './services/tokenUtils';
import Login from './pages/screens/loginPage/Login';
import Kitchen from './pages/screens/KitchenStaff';
import Waiter from './pages/screens/waiter/WaiterHome';
import Receptionist from './pages/screens/reception/Receptionist';
import Takeaway from './pages/screens/loginPage/TakeawayLogin';
import Menu from './pages/screens/waiter/MainMenu';
import ManageOrders from './pages/screens/waiter/ManageOrders';
import AddEmployee from './pages/screens/admin/AddEmployee';
import AddTable from './pages/screens/admin/AddTable';
import AddCategoryMenu from './pages/screens/admin/AddCategoryMenu';
import Dashboard from './pages/screens/admin/Dashboard';
import AdminHome from './pages/screens/admin/Admin';
import CustomerMenu from './pages/screens/customer/customerMenu';
import UpdateMenu from './pages/screens/waiter/updateMenu';
import RecepAddEmployee from './pages/screens/reception/RecepAddEmployee';
import RecepAddTable from './pages/screens/reception/RecepAddTable';
import RecepAddCategoryMenu from './pages/screens/reception/RecepAddCategoryMenu';
import RecepReport from './pages/screens/reception/RecepReport';
import History from './pages/screens/admin/History';
import RecepHistory from './pages/screens/reception/RecepHistory';
import Calendar from './pages/screens/admin/Calendar';
import RecepCalendar from './pages/screens/reception/RecepCalendar';
import WaiterTakeawayMenu from './pages/screens/waiter/WaiterTakeawayMenu';
import CookComments from './pages/screens/admin/CookComments';
import RecepCookComments from './pages/screens/reception/RecepCookComments';

function App() {  

  const navigate = useNavigate();
  const location = useLocation(); 
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (token && !isTokenExpired()) {
      const role = user?.role.toLowerCase();
  
      // Redirect only when opening the login page, avoiding infinite loops
      if (location.pathname === '/' || location.pathname === '/login') {
        navigate(`/${role}`, { replace: true });
        window.location.reload(); // Ensure no previous cache
      }
    }
  }, [location, token, user, navigate]);   

  return (
    <Routes>        
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/takeaway" element={<Takeaway />} />      
      <Route path="/customer-menu" element={<CustomerMenu />} />
      
      <Route path="/admin" element={<ProtectedRoute element={<AdminHome />} allowedRoles={["admin"]} />} >
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={["admin"]} />} />
          <Route path="add-employee" element={<ProtectedRoute element={<AddEmployee />} allowedRoles={["admin"]} />} />
          <Route path="add-table" element={<ProtectedRoute element={<AddTable />} allowedRoles={["admin"]} />} />
          <Route path="add-category-menu" element={<ProtectedRoute element={<AddCategoryMenu />} allowedRoles={["admin"]} />} />
          <Route path="cook-comments" element={<ProtectedRoute element={<CookComments />} allowedRoles={["admin"]} />} />
          <Route path="calendar" element={<ProtectedRoute element={<Calendar />} allowedRoles={["admin"]} />} />
          <Route path="history" element={<ProtectedRoute element={<History />} allowedRoles={["admin"]} />} />
      </Route>
      
      <Route path="/kitchen" element={<ProtectedRoute element={<Kitchen />} allowedRoles={["kitchen"]} />} />
      
      <Route path="/waiter" element={<ProtectedRoute element={<Waiter />} allowedRoles={["waiter"]} />} />
      <Route path="/waiter/menu" element={<ProtectedRoute element={<Menu />} allowedRoles={["waiter"]} />} />
      <Route path="/waiter/takeaway-menu" element={<ProtectedRoute element={<WaiterTakeawayMenu />} allowedRoles={["waiter"]} />} />
      <Route path="/waiter/manage-orders" element={<ProtectedRoute element={<ManageOrders />} allowedRoles={["waiter"]} />} />
      <Route path="/waiter/update-menu" element={<ProtectedRoute element={<UpdateMenu />} allowedRoles={["waiter"]} />} />

      <Route path="/receptionist" element={<ProtectedRoute element={<Receptionist />} allowedRoles={["receptionist"]} />} >
          <Route index element={<Navigate to="/receptionist/recep-history" />} />
          <Route path="recep-history" element={<ProtectedRoute element={<RecepHistory />} allowedRoles={["receptionist"]} />} />
          <Route path="recep-add-employee" element={<ProtectedRoute element={<RecepAddEmployee />} allowedRoles={["receptionist"]} />} />
          <Route path="recep-add-table" element={<ProtectedRoute element={<RecepAddTable />} allowedRoles={["receptionist"]} />} />
          <Route path="recep-add-category-menu" element={<ProtectedRoute element={<RecepAddCategoryMenu />} allowedRoles={["receptionist"]} />} />
          {/* <Route path="recep-report" element={<ProtectedRoute element={<RecepReport />} allowedRoles={["receptionist"]} />} /> */}
          <Route path="recep-cook-comments" element={<ProtectedRoute element={<RecepCookComments />} allowedRoles={["receptionist"]} />} />
          <Route path="recep-calendar" element={<ProtectedRoute element={<RecepCalendar />} allowedRoles={["receptionist"]} />} />
      </Route>

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;

