import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { AiOutlineEye } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../services/api";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import Swal from 'sweetalert2';
import { Paper } from "@mui/material";

const RecepAddEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "waiter",
    password: "",
    confirmPassword: "",
    profile_pic: null,
  });
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/users/all");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to undo this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      background: '#eff6ff',
      confirmButtonColor: 'red',
      cancelButtonColor: 'gray',
      customClass: {
        popup: "rounded-lg", // Adds border radius
      },
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return; // Stop execution if canceled
      }
        try {
          await api.delete(`/users/delete/${id}`);
          fetchEmployees();
        } catch (error) {
          console.error("Error deleting employee:", error);
          Swal.fire("Error", "Failed to delete employee. Please try again.", "error");
        }
     });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, profile_pic: e.target.files[0] });
    }
  };

  const openAddEmployeeModal = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "waiter",
      password: "",
      confirmPassword: "",
      profile_pic: null,
    });
    setIsModalOpen(true);
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const { confirmPassword, ...dataToSend } = formData; // Exclude confirmPassword
    const formDataObj = new FormData();
    Object.keys(dataToSend).forEach((key) => {
      formDataObj.append(key, dataToSend[key]);
    });

    try {
      await api.post("/users/create", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("Failed to add employee. Please try again.");
    }
  };

  const openViewModal = (employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      password: "",
      confirmPassword: "",
      profile_pic: employee.profile_pic,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    let updatedFields = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== "" && formData[key] !== selectedEmployee[key]) {
        updatedFields[key] = formData[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes detected.");
      return;
    }

    try {
      await api.put(`/users/update/${selectedEmployee.id}`, updatedFields);
      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee. Please try again.");
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3 md:p-3 bg-gray-200 h-full">
      <h1 className="text-2xl font-bold mb-3 text-center text-blue-950">
       Employee Management
      </h1>
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 w-full max-w-md border rounded-xl shadow-sm focus:outline-none"
        />
        <button
          onClick={openAddEmployeeModal}
          className="ml-4 min-w-[149px] w-auto bg-blue-50 px-4 py-2 rounded-xl shadow text-blue-950 font-semibold"
        >
          + Add Employee
        </button>
      </div>

      <Paper elevation={4} sx={{borderRadius: "20px"}} className="bg-white rounded-xl shadow-lg overflow-hidden max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-blue-50 text-blue-950">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp, index) => (
                <tr
                  key={emp.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-100"
                  } hover:bg-gray-200`}
                >
                  <td className="py-3 px-4">{emp.name}</td>
                  <td className="py-3 px-4">{emp.email}</td>
                  <td className="py-3 px-4">{emp.phone}</td>
                  <td className="py-3 px-4">{emp.role}</td>
                  <td className="py-3 px-4 text-center flex justify-center gap-4">
                    <button
                      onClick={() => openViewModal(emp)}
                      className="text-green-600 hover:underline"
                    >
                      <AiOutlineEye />
                    </button>
                    <button
                      className="text-blue-600"
                      onClick={() => handleEdit(emp)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-600 hover:underline"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Paper>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
         
            <button
              className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 text-red-500 bg-white rounded-full p-2 shadow hover:bg-gray-100"
              onClick={() =>  setIsModalOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>
            
            <h2 className="text-2xl font-bold mb-4">Add Employee</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                maxLength={30}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone.slice(0,15)}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl"
              />

              {/* Role Dropdown */}
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl"
                required
              >
                <option value="waiter">Waiter</option>
                {/* <option value="kitchen">Kitchen</option> */}
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                maxLength={20}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl"
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                maxLength={20}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-xl"
              />

              <input
                type="file"
                onChange={handleFileChange}
                // required
                className="w-full p-3 border rounded-xl"
              />
              <button
                type="submit"
                className="w-full bg-blue-50 font-semibold py-3 rounded-xl hover:bg-blue-200"
              >
                Add Employee
              </button>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
            {/* Close Button */}
            <button
              className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 text-red-500 bg-white rounded-full p-2 shadow hover:bg-gray-100"
              onClick={closeViewModal}
            >
              <MdClose className="text-2xl" />
            </button>

            {/* Profile Image */}
            {selectedEmployee.profile_pic && (
              <div className="flex justify-center mb-4">
                <img
                  src={`${api.defaults.baseURL}/${selectedEmployee.profile_pic.replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-gray-200 shadow-sm"
                />
              </div>
            )}

            {/* Employee Details */}
            <h2 className="text-2xl font-bold text-center mb-4 text-blue-950">
              Employee Details
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="flex justify-between border-b pb-2">
                <span className="font-semibold">Name:</span>{" "}
                <span>{selectedEmployee.name}</span>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="font-semibold">Email:</span>{" "}
                <span>{selectedEmployee.email}</span>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="font-semibold">Phone:</span>{" "}
                <span>{selectedEmployee.phone}</span>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="font-semibold">Role:</span>{" "}
                <span className="capitalize">{selectedEmployee.role}</span>
              </p>
              <p className="flex justify-between border-b pb-2">
                <span className="font-semibold">Created At:</span>
                <span>
                  {new Date(selectedEmployee.created_at).toLocaleDateString(
                    "en-GB"
                  )}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Updated At:</span>
                <span>
                  {new Date(selectedEmployee.updated_at).toLocaleDateString(
                    "en-GB"
                  )}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">

            <button
              className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 text-red-500 bg-white rounded-full p-2 shadow hover:bg-gray-100"
              onClick={() =>  setIsEditModalOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="text-2xl font-bold mb-4">Edit Employee</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="text" name="name" value={formData.name} maxLength={30} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border rounded-xl" />
              <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border rounded-xl" />
              <input type="tel" name="phone" value={formData.phone.slice(0,15)} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 border rounded-xl" />
              <select name="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full p-3 border rounded-xl">
                <option value="waiter">Waiter</option>
                {/* <option value="kitchen">Kitchen</option> */}
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
              </select>
              <input type="password" name="password" placeholder="Enter new password" value={formData.password} maxLength={20} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full p-3 border rounded-xl" />
              {/* <input type="file" name="profile_pic" onChange={(e) => setFormData({ ...formData, profile_pic: e.target.files[0] })} className="w-full p-3 border rounded-xl" /> */}
              <button type="submit" className="w-full bg-blue-50 font-semibold py-3 rounded-xl hover:bg-blue-200">Update Employee</button>
            </form>
          </div>
        </div>
      )}
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </div>
  );
};

export default RecepAddEmployee;
