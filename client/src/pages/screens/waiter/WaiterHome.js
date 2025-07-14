import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowCircleRight } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdLogout } from 'react-icons/md';
import Paper from '@mui/material/Paper';
import useLogout from '../../../services/logout';
import api from '../../../services/api';
import Swal from 'sweetalert2';

function Waiter() {
  const navigate = useNavigate();
  const logout = useLogout();
  const [tables, setTables] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));
  const waiterId = user?.id; // This is the logged-in waiter's ID
  const waiterName = user?.name;

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
  
    window.addEventListener('popstate', handlePopState);
  
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);  
  
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await api.get("/tables/all");
  
        if (response.status === 200) {
          // Filter tables assigned to this waiter
          const assignedTables = response.data.filter(table => table.assigned_waiter === waiterId);
          setTables(assignedTables);
        } else {
          toast.error("Failed to fetch tables");
        }
      } catch (error) {
        toast.error('Error fetching tables');
      }
    };

    fetchTables();
  }, [waiterId]);


  const checkOrderAvailability = async () => {
    try {
      const response = await api.get("/res-schedule/can-take-orders");
  
      if (response.status === 200) {
        return true; // Order-taking is allowed
      } else {
        Swal.fire({
          title: "Order Not Allowed",
          text: response.data?.message || "Order taking is not allowed at the moment.",
          icon: "error",
          confirmButtonText: "OK",
          background: "#eff6ff", 
          confirmButtonColor: "red", 
          customClass: {
            popup: "rounded-lg", 
          },
        });
        return false; 
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error checking order status. Try again!";
      Swal.fire({
        title: "Order Not Allowed",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        background: "#fff5f5", // Light red background
        confirmButtonColor: "#d33", // Red button for error
        customClass: {
          popup: "rounded-lg",
        },
      });
      return false; 
    }
  };

  const handleTableSelection = async (table) => {
    const canTakeOrders = await checkOrderAvailability();
  
    if (canTakeOrders) {
      Swal.fire({
        title: "Choose Order Type",
        // text: "Is this order for Dine-In or Takeaway?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Dine-In",
        cancelButtonText: "Takeaway",
        confirmButtonColor: "#172554", // Blue for Dine-In
        cancelButtonColor: "#f59e0b", // Orange for Takeaway
        background: "#eff6ff", // Light background
        customClass: {
          popup: "rounded-lg", // Adds border radius
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to Dine-In order screen
          navigate(`/waiter/menu?tableId=${table.id}`, { replace: true });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Navigate to Takeaway order screen
          navigate(`/waiter/takeaway-menu?tableId=${table.id}`, { replace: true });
        }
      });
    }
  };

  const handleManageOrders = () => {
    navigate('/waiter/manage-orders', {replace: true});
  };

  return (
    <div className="min-h-screen flex flex-col bg-tertiary">
      <header className="w-full bg-blue-50 py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-black">{waiterName}</h1>
        <button
          onClick={logout}
          className="flex items-center justify-center w-12 h-12 bg-white text-secondary rounded-full hover:text-red-600 transition duration-300"
        >
          <MdLogout className="text-2xl" />
        </button>
      </header>

      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Paper elevation={3} sx={{borderRadius: "15px"}} className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
          <div className="space-y-6">
            <div className="p-6 bg-tertiary rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-center mb-4">Select Table</h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                {tables.length > 0 ? (
                  tables.map((table) => (
                    <button
                      key={table.id}
                      className="w-full aspect-square flex items-center justify-center text-sm font-semibold rounded-sm transition-all duration-300 text-center bg-white text-secondary border-2 border-secondary hover:bg-tertiary"
                      onClick={() => handleTableSelection(table)}
                    >
                      T{table.table_number}
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 col-span-4 sm:col-span-5">No tables were assigned</p>
                )}
              </div>
            </div>

            <div
              className="p-6 bg-tertiary rounded-lg shadow-md flex items-center justify-between cursor-pointer"
              onClick={handleManageOrders}
            >
              <h2 className="text-xl font-semibold text-secondary">Manage Orders</h2>
              <FaArrowCircleRight className="text-4xl text-secondary cursor-pointer" />
            </div>
          </div>
        </Paper>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Waiter;
