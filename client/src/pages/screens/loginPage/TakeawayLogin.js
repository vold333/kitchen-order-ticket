import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackSharp } from "react-icons/io5";
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { MdPerson, MdPhone } from "react-icons/md";
import api from '../../../services/api';
import { TextField, InputAdornment, Button } from "@mui/material";

function Takeaway() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleMenuNavigation = async () => {
    if (!name || !mobile) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      // Fetch all customers
      const { data: customers } = await api.get('/customer/unauth/all');
      const existingCustomer = customers.find(customer => customer.phone === mobile);

      if (existingCustomer) {
        navigate('/customer-menu', { state: { name, customer_id: existingCustomer.id } });
      } else {
        // Add new customer
        const postResponse = await api.post('/customer/unauth/create', { name, phone: mobile });

        if (postResponse.status === 200 || postResponse.status === 201) {
          const newCustomerId = postResponse.data.id; // Assuming API returns created customer's id
          toast.success('Customer added successfully!');
          setTimeout(() => {
            navigate('/customer-menu', { state: { name, customer_id: newCustomerId }, replace: true });
          }, 500);
        } else {
          toast.error('Failed to add customer.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while processing your request.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 md:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full sm:w-96 md:w-1/2 lg:w-1/3 mt-24 sm:mt-32">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6 text-secondary">Takeaway</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <div className="mb-6 relative">
          <TextField
            id="input-with-icon-textfield"
            // label="Username"
            placeholder='Your Name'
            variant="standard" // You can change to "standard" or "filled" if needed
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdPerson style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px", 
              },
            }}
          />
        </div>

        <div className="mb-6 relative">
          <TextField
            id="input-with-icon-textfield"
            // label="Username"
            placeholder='Your Phone Number'
            variant="standard" // You can change to "standard" or "filled" if needed
            fullWidth
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdPhone style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px", 
              },
            }}
          />
        </div>

        <Button variant="contained" fullWidth onClick={handleMenuNavigation}
          sx={{
            py: 1.3, 
            backgroundColor: "#eff6ff", 
            color: "#172554", 
            fontSize: "1.125rem", 
            fontWeight: "bold",
            borderRadius: "8px", 
            transition: "background-color 0.3s", 
            textTransform: "none"           
          }}
        >Select Menu</Button>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate(-1)}
            className="text-black hover:text-teal-900 flex items-center"
          >
            <IoArrowBackSharp className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
      </div>
      <ToastContainer position='top-center' autoClose={1000} hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  );
}

export default Takeaway;
