import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../../services/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdPerson } from "react-icons/md";
import { TextField, InputAdornment, Button, Alert, Snackbar } from "@mui/material";
import { IoKey } from "react-icons/io5";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = () => {
      window.history.go(1);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const user = await login(username, password); // Get decoded user data

      if (user) {
        toast.success("Login successful!");
        // setAlert({ open: true, message: "Login successful!", severity: "success" });

        const role = user.role.toLowerCase(); // Get role from the decoded user data
        console.log(`Navigating to: /${role}`);
        navigate(`/${role}`, { replace: true }, { state: { username } }); // Navigate based on role
      }
    } catch (err) {
      setError("Please check your credentials.");
      toast.error("Login failed!");
      // setAlert({ open: true, message: "Login failed!", severity: "error" });
    }
  };

  const navigateToTakeaway = () => {
    navigate("/takeaway");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 md:px-8">
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full sm:w-96 md:w-1/2 lg:w-1/3 mt-24 sm:mt-32">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6 text-secondary">
          KOT Login
        </h2>
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4 relative">
            <TextField
              id="input-with-icon-textfield"
              label="Username"
              variant="standard" // You can change to "standard" or "filled" if needed
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

          <div className="mb-4 relative">

            <TextField
              id="input-with-icon-textfield"
              label="Password"
              variant="standard" // You can change to "standard" or "filled" if needed
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IoKey style={{ color: "gray" }} />
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

          <Button variant="contained" fullWidth type="submit" 
            sx={{
              py: 1.3, 
              backgroundColor: "#eff6ff", 
              color: "#172554", 
              fontSize: "1.125rem", 
              fontWeight: "bold",
              borderRadius: "8px", 
              transition: "background-color 0.3s",            
            }}
          >Login</Button>

        </form>
        <p className="text-center text-gray-600 mt-4">
          For Customer Takeaway,{" "}
          <button
            onClick={navigateToTakeaway}
            className="text-blue-800 underline hover:text-blue-950"
          >
            Click Here
          </button>
        </p>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
      {/* <Snackbar
        open={alert.open}
        autoHideDuration={1500}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar> */}
    </div>
  );
}

export default Login;
