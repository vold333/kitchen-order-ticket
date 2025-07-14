import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { MdLogout, MdDelete, MdEdit, MdClose } from "react-icons/md";
import { IoCheckmarkDoneSharp, IoArrowBack } from "react-icons/io5";
import api from "../../../services/api";
import useLogout from "../../../services/logout";
import { FaEye } from "react-icons/fa";
import qrImage from "../../../assets/images/qr.png";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [activeTab, setActiveTab] = useState("Active");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null); 
  const [paymentModalOpen, setPaymentModalOpen] = useState(false); 
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [paymentType, setPaymentType] = useState(""); 
  const [transactionId, setTransactionId] = useState("");
  const [proofFile, setProofFile] = useState(null); 
  const [filterDate, setFilterDate] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);

  const navigate = useNavigate();
  const logout = useLogout();
  const user = JSON.parse(localStorage.getItem("user"));
  const waiterId = user?.id;
  const tableOptions = [
    { label: "All Tables", value: "" }, 
    ...[...new Set(orders.map(order => order.table_id))]
      .map(tableId => {
        const table = tables.find(t => t.id === tableId);
        return { label: `Table ${table?.table_number || tableId}`, value: tableId };
      })
  ];

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

  // Set today's date as the default value for the date filter
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    setFilterDate(today); 
  }, []);

  // Fetch active or completed orders based on the active tab
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/all");
        const filteredOrders =
          activeTab === "Active"
            ? response.data.filter(
                (order) => order.waiter_id === waiterId && order.status !== "served"
              )
            : response.data.filter((order) => order.waiter_id === waiterId && order.status === "served");
        setOrders(filteredOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders. Please try again.", { autoClose: 1500 });
      }
    };

    const fetchTables = async () => {
      try {
        const response = await api.get("/tables/all");
        if (response.status === 200) {
          setTables(response.data);
        } else {
          toast.error("Failed to fetch tables");
        }
      } catch (error) {
        toast.error("Error fetching tables");
      }
    };
  
    fetchTables();
    fetchOrders();
  }, [waiterId, activeTab]);

  // Function to get table number from table_id
  const getTableNumber = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.table_number : "N/A";
  };

  // Fetch order items for a specific order
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/orderItems/orders/${orderId}`);
      setSelectedOrderDetails(response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to fetch order details. Please try again.", { autoClose: 1500 });
    }
  };

  const handlePrintPaymentBill = async (orderId, table_number, orderType, items, subtotal, gst, discount, finalTotal, paymentType) => {
      try {

          // // Fetch table details to get the table_number
          // const tableResponse = await api.get(`/tables/${tableId}`);
          // const table_number = tableResponse.data.table_number;

          const orderData = {
              order_id: orderId,
              table_number: table_number,
              order_type: orderType,
              date_time: new Date().toLocaleString(),
              items: items,
              subtotal: subtotal,
              gst: gst,
              discount: discount,
              total_amount: finalTotal,
              payment_type: paymentType
          };

          await api.post("/print/payment-bill", orderData);
          toast.success("Payment Bill Printed Successfully!", { autoClose: 1500 });
      } catch (error) {
          console.error("Error printing payment bill:", error);
          toast.error("Failed to print payment bill.", { autoClose: 1500 });
      }
  };

  // Handle marking an order as served
  const handleMarkAsCompleted = async (orderId) => {
    if (!paymentType) {
      toast.error("Please select a payment method!", { autoClose: 1500 });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("payment_type", paymentType);
      formData.append("status", "served");

      if (paymentType === "qr") {
        if (!transactionId || !proofFile) {
          toast.error("Please provide transaction ID and proof file.", {
            autoClose: 1500,
          });
          return;
        }
        formData.append("transaction_id", transactionId);
        formData.append("proof", proofFile);
      }

      await api.put(`/orders/update/${selectedOrderId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Order marked as served!", { autoClose: 1500 });

      // Fetch order details to get discount and tableId
      const orderResponse = await api.get(`/orders/${orderId}`);
      const orderData = orderResponse.data;
      const discountPercentage = orderData.discount || 0; // Discount as percentage
      const tableId = orderData.tableId?.id;
      const tableNumber = orderData.tableId?.table_number;

      // Fetch all items
      const itemsResponse = await api.get("/items/all");
      const allItems = itemsResponse.data;

      // Fetch order items and calculate bill details
      const response = await api.get(`/orderItems/orders/${orderId}`);
      const items = response.data;

       // Map item IDs to names
      const itemsWithNames = items.map((item) => {
        const foundItem = allItems.find((i) => i.id === item.item_id);
        return {
          ...item,
          name: foundItem ? foundItem.name : "Unknown Item",
        };
      });

      const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const gst = subtotal * 0.09;
      const totalBeforeDiscount = subtotal + gst;

      // **Calculate Discount Amount**
      const discountAmount = (totalBeforeDiscount * discountPercentage) / 100;

      // **Calculate Final Total**
      const finalTotal = totalBeforeDiscount - discountAmount;
      
      // Print Payment Bill
      await handlePrintPaymentBill(orderId, tableNumber, "DINE-IN", itemsWithNames, subtotal, gst, discountAmount, finalTotal, paymentType);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "served" } : order
        )
      );
    } catch (error) {
      console.error("Error marking order as served:", error);
      toast.error("Failed to mark order as served. Please try again.", { autoClose: 1500 });
    }
  };

  // Filter orders based on selected table and active tab
  const filteredOrders = orders.filter((order) =>
    (!selectedTable || order.table_id === selectedTable) &&
    (activeTab === "Active"
      ? order.status !== "served" // Show all active (pending) orders from any date
      : order.status === "served" &&
        filterDate &&
        new Date(order.created_at).toDateString() ===
          new Date(filterDate).toDateString()) &&
    (!filterDate || order.status !== "served" || 
      new Date(order.created_at).toDateString() === new Date(filterDate).toDateString()) &&
    order.waiter_id === waiterId // Only show orders assigned to the logged-in waiter
  );

  return (
    <div className="flex flex-col min-h-screen bg-tertiary">
      
      {/* Header */}
      <header className="w-full bg-tertiary py-3 px-3 flex justify-between items-center">
        <button
          onClick={() => navigate("/waiter")}
          className="flex items-center justify-center w-10 h-10 bg-white text-secondary rounded-full hover:text-blue-600 transition duration-300"
        >
          <IoArrowBack className="text-2xl" />
        </button>
        <h1 className="text-xl sm:text-3xl md:text-2xl xl:text-3xl font-bold text-secondary">
          Manage Orders
        </h1>
        <button
          onClick={logout}
          className="flex items-center justify-center w-10 h-10 bg-white text-secondary rounded-full hover:text-red-600 transition duration-300"
        >
          <MdLogout className="text-2xl" />
        </button>
      </header>

      <div className="flex-grow flex flex-col items-center px-2 py-2">
        <div className="w-full max-w-4xl bg-white p-4 sm:p-6 rounded-lg shadow-lg">
          
          <div className="flex flex-row md:flex-row justify-center items-center space-y-0 md:space-y-0 space-x-6 md:space-x-6 mb-4">
            {/* Table Selector */}
            <div className="flex items-center">
              <Autocomplete
                disablePortal
                options={tableOptions}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value}
                value={tableOptions.find(option => option.value === selectedTable) || null}
                onChange={(event, newValue) => setSelectedTable(newValue ? newValue.value : "")}
                sx={{ width: 150 }}
                disableClearable
                freeSolo={false}
                renderInput={(params) => <TextField {...params} label="Select Table" inputProps={{ ...params.inputProps, readOnly: true }} />}
              />
            </div>

            {/* Date Filter for Completed Tab */}
            {activeTab === "Completed" && (
              <div className="flex items-center">        
                <input
                  type="date"
                  id="filterDate"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>

          {/* Orders List */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{activeTab} Orders</h2>
            {filteredOrders.length > 0 ? (
              <ul className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 w-full max-h-[60vh] sm:max-h-[64vh] md:max-h-[65vh] lg:max-h-[64vh] xl:max-h-[67vh] overflow-y-auto">
                {filteredOrders.map((order) => (
                  <li
                    key={order.id}
                    className="w-full flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-md"
                  >
                    <div>
                      <p className="font-bold text-base sm:text-lg md:text-xl">Order #{order.id}</p>
                      <p className="text-sm sm:text-sm md:text-lg text-gray-600">
                        Table: {getTableNumber(order.table_id)} | Total: ${order.total_amount}
                      </p>
                    </div>
                    {activeTab === "Active" && (
                      <div className="flex gap-2">
                      
                        <button
                          onClick={() => fetchOrderDetails(order.id)}
                          className="w-7 h-7 bg-white text-secondary rounded-full hover:text-white hover:bg-secondary flex items-center justify-center ml-2"
                        >
                          <FaEye className="text-base" />
                        </button>

                        <button
                          onClick={() => navigate(`/waiter/update-menu?tableId=${order.table_id}`, { state: { orderId: order.id } })}
                          className="w-7 h-7 bg-white text-secondary rounded-full hover:bg-secondary hover:text-white flex items-center justify-center"
                        >
                          <MdEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => {
                            // handleMarkAsCompleted(order.id);
                            setSelectedOrderId(order.id);
                            setPaymentModalOpen(true);
                          }}
                          className="w-7 h-7 bg-white text-secondary rounded-full hover:bg-secondary hover:text-white flex items-center justify-center"
                        >
                          <IoCheckmarkDoneSharp className="text-lg" />
                        </button>
                      </div>
                    )}
                    {activeTab === "Completed" && (
                      <button
                        onClick={() => fetchOrderDetails(order.id)}
                        className="w-7 h-7 bg-white text-secondary rounded-full hover:text-white hover:bg-secondary flex items-center justify-center ml-2"
                      >
                        <FaEye className="text-base" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm sm:text-base text-gray-500">
                No {activeTab.toLowerCase()} orders yet.
              </p>
            )}
          </div>

          {/* Payment Modal */}
          {paymentModalOpen && (
            <div
              onClick={() => setPaymentModalOpen(false)} // Close modal when clicking outside
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            >
              <div
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                className="bg-white p-6 rounded-lg shadow-lg w-10/12 max-w-sm"
              >
              
                {/* Close Button */}
                <button
                  onClick={() => {setPaymentModalOpen(false);
                    setSelectedOrderId(null); // Reset selected order ID
                    setPaymentType("");       // Reset payment type
                    setTransactionId("");      // Reset transaction ID
                    setProofFile(null);        // Reset proof file
                  }}
                  className="float-right text-gray-500 hover:text-gray-700 transition duration-300"
                >
                  <MdClose size={24} />
                </button>

                {/* Modal Header */}
                <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h3>

                {/* Payment Type Selection */}
                <div className="mb-4">
                  <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type:
                  </label>
                  <select
                    id="paymentType"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                  >
                    <option value="">Select Payment Type</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="qr">QR</option>
                    <option value="foc">FOC</option>
                  </select>
                </div>

                {/* QR-Specific Fields */}
                {paymentType === "qr" && (
                  <>
                    <div className="mb-4">
                      <img
                        src={qrImage} // Dynamically create a URL for the uploaded file
                        alt="QR Proof"
                        className="w-32 h-32 object-cover rounded-md border border-gray-300 mx-auto mb-2"
                      />
                      <p className="text-xs text-center text-gray-500 italic">
                        Note: Ensure the QR code is clear and scannable.
                      </p>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction ID:
                      </label>
                      <input
                        type="text"
                        id="transactionId"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="proofFile" className="block text-sm font-medium text-gray-700 mb-1">
                        Proof File:
                      </label>
                      <input
                        type="file"
                        id="proofFile"
                        onChange={(e) => setProofFile(e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                      />
                    </div>
                  </>
                )}
             
                <button
                    onClick={async () => {
                        if (loading) return; // Prevent double submission
                        setLoading(true);    // Start loading
                        try {
                            await handleMarkAsCompleted(selectedOrderId);
                            setPaymentModalOpen(false);
                        } catch (error) {
                            console.error("Error marking order as served:", error);
                            toast.error("Failed to mark order as served. Please try again.", { autoClose: 1500 });
                        } finally {
                            setLoading(false); // Stop loading
                        }
                    }}
                    disabled={loading} // Disable button while loading
                    className="w-full bg-secondary text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
                >
                    {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}

          {/* Order Details Modal */}
          {selectedOrderDetails && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
              onClick={() => setSelectedOrderDetails(null)} // Close modal when clicking outside
            >
              <div
                className="bg-white p-6 rounded-lg w-10/12 max-w-md max-h-[65vh] flex flex-col relative"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              >

                {/* Close Button */}
                <button
                  className="absolute -top-4 -right-4 bg-white border border-gray-300 rounded-full text-red-500 p-2 shadow-md hover:bg-gray-100 z-50"
                  onClick={() => setSelectedOrderDetails(null)}
                >
                  <MdClose className="text-2xl" />
                </button>

                {/* Header (Fixed) */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Order Details</h2>                 
                </div>

                {/* Scrollable Order List */}
                <div className="overflow-y-auto flex-1">
                  <ul>
                    {selectedOrderDetails.map((item, index) => {
                      const gstRate = 0.09;
                      const basePrice = item.price / (1 + gstRate);
                      const gstAmount = item.price - basePrice;

                      return (
                        <li key={item.id} className="mb-2">
                          <p className="font-medium">{index + 1}. {item.itemId.name}</p>
                          <p className="ml-4 text-sm text-gray-500">
                            Qty: {item.quantity} | Price: ${item.price} (GST: ${gstAmount.toFixed(2)})
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Tab Navigation */}
        <div className="w-full fixed bottom-0 bg-white shadow-md flex justify-around py-3">
          {[
            { tab: "Active", icon: <IoCheckmarkDoneSharp className="text-xl sm:text-2xl" /> },
            { tab: "Completed", icon: <MdDelete className="text-xl sm:text-2xl" /> },
          ].map(({ tab, icon }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center ${
                activeTab === tab ? "text-secondary font-bold" : "text-gray-500"
              }`}
            >
              {icon}
              <span className="text-sm sm:text-base mt-1">{tab} Orders</span>
            </button>
          ))}
        </div>

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </div>
  );
}

export default ManageOrders;