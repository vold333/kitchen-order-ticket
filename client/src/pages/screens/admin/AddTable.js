import React, { useState, useEffect } from "react";
import { MdClose, MdDelete, MdModeEditOutline } from "react-icons/md";
import api from "../../../services/api";
import { Paper } from "@mui/material";
import Swal from 'sweetalert2';

const AddTable = () => {
  const [tables, setTables] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({
    table_number: "",
    capacity: "",
    status: "available",
    assignedWaiter: "",
  });

  useEffect(() => {
    fetchTables();
    fetchWaiters();
  }, []);

  const fetchTables = async () => {
    const response = await api.get("/tables/all");
    setTables(response.data);
  };

  const fetchWaiters = async () => {
    const response = await api.get("/users/waiters");
    setWaiters(response.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/tables/create", {
      table_number: formData.table_number,
      capacity: formData.capacity,
      status: formData.tableStatus,
      assigned_waiter: formData.assignedWaiter,
    });
    fetchTables();
    setFormData({ table_number: "", capacity: "", tableStatus: "available", assignedWaiter: "" });
    setIsAddModalOpen(false);
  };

  const openEditModal = (table) => {
    setSelectedTable(table);
    setFormData({
      table_number: table.table_number,
      capacity: table.capacity,
      status: table.status,
      assignedWaiter: table.assigned_waiter,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/tables/update/${selectedTable.id}`, {
      table_number: formData.table_number,
      capacity: formData.capacity,
      status: formData.status,
      assigned_waiter: formData.assignedWaiter,
    });
    fetchTables();
    setIsEditModalOpen(false);
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
        await api.delete(`/tables/delete/${id}`);
        fetchTables();
      });
  };  

  const openAddModal = () => {
    setFormData({ table_number: "", capacity: "", tableStatus: "available", assignedWaiter: "" });
    setIsAddModalOpen(true);
  };

  const filteredTables = tables.filter((table) =>
    table.table_number.toString().includes(search) ||
    table.status.toLowerCase().includes(search.toLowerCase()) ||
    waiters.find(w => w.id === table.assigned_waiter)?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3 md:p-4 bg-gray-200 h-full">
      <h1 className="text-2xl font-bold mb-3 md:mb-3 text-center text-secondary">Manage Tables</h1>
      <div className="flex flex-row justify-between items-center mb-3">
        <input
          type="text"
          placeholder="Search by Table Number, Waiter, or Status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 w-full md:max-w-md border rounded-xl shadow-sm"
        />
        <button
          onClick={openAddModal}
          className="ml-4 md:mt-0 min-w-[130px] w-auto bg-tertiary text-secondary font-semibold px-4 py-2 rounded-xl shadow"
        >
          + Add Table
        </button>
      </div>

      <div className="xl:h-[700px] lg:h-[900px] md:h-[600px] overflow-auto">
        <div className="grid ml-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {filteredTables.map((table) => (
            <Paper elevation={4} sx={{borderRadius: "20px"}}
              key={table.id}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center"
            >
              <p className="text-xl font-semibold text-gray-800">Table {table.table_number}</p>
              <p className="text-gray-600">Capacity: <span className="font-medium">{table.capacity}</span></p>
              <p className="text-gray-600">
                Status: 
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    table.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {table.status}
                </span>
              </p>
              <p className="text-gray-600">
                Waiter:  
                <span className="font-medium ml-1 text-gray-800">
                  {waiters.find((w) => w.id === table.assigned_waiter)?.name || "Unassigned"}
                </span>
              </p>

              <div className="flex justify-between mt-4 w-full px-6">
                <button 
                  onClick={() => openEditModal(table)} 
                  className="bg-secondary text-white px-2 py-2 rounded-full flex items-center gap-2 hover:bg-tertiary hover:text-secondary transition"
                >
                  <MdModeEditOutline className="text-xl" />
                </button>
                <button 
                  onClick={() => handleDelete(table.id)} 
                  className="bg-red-500 text-white px-2 py-2 rounded-full flex items-center gap-2 hover:bg-red-600 transition"
                >
                  <MdDelete className="text-xl" /> 
                </button>
              </div>
            </Paper>
          ))}
        </div>
      </div>

      {isAddModalOpen && (
        <TableModal title="Add Table" formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} closeModal={() => setIsAddModalOpen(false)} waiters={waiters} />
      )}
      {isEditModalOpen && (
        <TableModal title="Edit Table" formData={formData} handleChange={handleChange} handleSubmit={handleEditSubmit} closeModal={() => setIsEditModalOpen(false)} waiters={waiters} />
      )}
    </div>
  );
};

const TableModal = ({ title, formData, handleChange, handleSubmit, closeModal, waiters }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
  
      <button
        className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 text-red-500 bg-white rounded-full p-2 shadow hover:bg-gray-100"
        onClick={closeModal}
      >
        <MdClose className="text-2xl" />
      </button> 
      
      <h2 className="text-2xl font-extrabold mb-4">{title}</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="table_number" value={String(formData.table_number || "").slice(0, 4)} onChange={handleChange} required className="w-full p-3 border rounded-xl mb-3" placeholder="Table Number" />
        <input type="number" name="capacity" value={formData.capacity ? formData.capacity.toString().slice(0, 2) : ""} onChange={handleChange} required className="w-full p-3 border rounded-xl mb-3" placeholder="Capacity" />
        <select name="status" value={formData.status} onChange={handleChange} required className="w-full p-3 border rounded-xl mb-3">
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="occupied">Occupied</option>
        </select>
        <select name="assignedWaiter" value={formData.assignedWaiter} onChange={handleChange} required className="w-full p-3 border rounded-xl mb-3">
          <option value="">Select Waiter</option>
          {waiters.map(waiter => (
            <option key={waiter.id} value={waiter.id}>{waiter.name}</option>
          ))}
        </select>
        <button type="submit" className="w-full bg-tertiary text-secondary hover:bg-primary text-lg font-semibold py-3 rounded-xl">Save</button>
      </form>
    </div>
  </div>
);

export default AddTable;
