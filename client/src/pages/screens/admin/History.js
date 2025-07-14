import React, { useEffect, useState } from "react";
import { FaBackward, FaEye, FaForward } from "react-icons/fa";
import api from "../../../services/api";
import { ImCross } from "react-icons/im";
import { MdClose } from "react-icons/md";
import { ToggleButton, ToggleButtonGroup, Paper } from "@mui/material";

const History = () => {
  // State variables
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // Track selected order for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Control modal visibility
  const [fullScreenImage, setFullScreenImage] = useState("");
  const itemsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersResponse = await api.get("/orders/all");
        const fetchedOrders = ordersResponse.data;

        // Fetch order items
        const orderItemsResponse = await api.get("/orderItems/all");
        const fetchedOrderItems = orderItemsResponse.data;
        
        // Fetch items
        const itemsResponse = await api.get("/items/all");
        const fetchedItems = itemsResponse.data;

        // Combine data
        const enrichedOrders = fetchedOrders.map((order) => {
          const items = fetchedOrderItems
            .filter((item) => item.order_id === order.id)
            .map((orderItem) => {
              const itemDetails = fetchedItems.find((item) => item.id === orderItem.item_id);
              return {
                ...orderItem,
                itemName: itemDetails?.name || "Unknown",
                itemPrice: itemDetails?.price || "0.00",
              };
            });
          return {
            ...order,
            items,
          };
        });

        setOrders(enrichedOrders);
        applyFilters(enrichedOrders); // Apply filters initially
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Get orders for the current page
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Apply filters based on selected criteria
  const applyFilters = (data) => {
    let filtered = data;

    // Filter by order type
    if (filterType !== "all") {
      filtered = filtered.filter((order) => order.order_type === filterType);
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(
        (order) => new Date(order.created_at).toISOString().split("T")[0] === selectedDate
      );
    }

    // Universal search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          String(order.id).includes(query) ||
          (order.waiterId?.name?.toLowerCase().includes(query) || false) ||
          (order.customerId?.name?.toLowerCase().includes(query) || false) ||
          order.status.toLowerCase().includes(query) ||
          order.payment_type.toLowerCase().includes(query)
      );
    }
    setFilteredOrders(filtered);
  };

  useEffect(() => {
    applyFilters(orders, filterType, selectedDate, searchQuery);
  }, [filterType, selectedDate, searchQuery, orders]);

  // Handle filter change
  const handleFilterChange = (type) => {
    setFilterType(type);
    applyFilters(orders);
  };

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    applyFilters(orders);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDate(""); // Clear the selected date
    applyFilters(orders); // Reapply filters to show all orders
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    applyFilters(orders);
  };

  // Open modal and set selected order
  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="p-2 sm:p-2 md:p-2 lg:p-4 bg-gray-200 h-full">
      <h1 className="text-2xl sm:text-2xl font-bold mb-2 sm:mb-2 text-center text-secondary">Order History</h1>

      <Paper elevation={2} sx={{borderRadius: "20px"}} className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-md mb-6 gap-4 sm:gap-6 w-full">
  
        {/* Search Bar */}
        <div className="flex items-center w-full sm:w-44 md:w-44 lg:w-auto space-x-3 bg-gray-100 px-3 py-2 rounded-full shadow-sm border-2">
          <input
            type="text"
            placeholder="Search by Order ID or Waiter Name"
            value={searchQuery}
            onChange={handleSearch}
            className="bg-transparent outline-none w-full"
          />
        </div>

        {/* Filter Buttons - Wrap for mobile scrolling */}
        <div className="flex justify-center space-x-3 overflow-auto sm:overflow-visible w-full sm:w-auto">         
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={(event, newType) => newType && handleFilterChange(newType)}
            sx={{
              "& .MuiToggleButton-root": {
                px: 3,
                py: 1,
                color: "black",
                fontWeight: "bold",
                borderRadius: "0px",
                boxShadow: 1,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                backgroundColor: "#ffffff",
                
              },
              "& .Mui-selected": {
                backgroundColor: "#172554",
                color: "white",
                boxShadow: 3,     
              }
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="dine_in">Dine-In</ToggleButton>
            <ToggleButton value="takeaway">Takeaway</ToggleButton>
          </ToggleButtonGroup>
        </div>

        {/* Date Picker - Ensure it doesn’t overflow */}
        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-xl shadow-sm w-full sm:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            onFocus={(e) => e.target.showPicker()}
            className="bg-transparent outline-none flex-1"
          />
          {selectedDate && (
            <button
              className="flex items-center justify-center bg-red-500 w-8 h-8 text-white rounded-full hover:bg-white hover:text-red-500 transition-all"
              onClick={clearDateFilter}
            >
              <ImCross className="h-4 w-4" />
            </button>
          )}
        </div>
      </Paper>

      {/* Order List */}
      <div className="space-y-4 max-h-[52vh] pb-1 sm:max-h-[58vh] md:max-h-[65vh] lg:max-h-[64vh] xl:max-h-[67vh] overflow-y-auto pr-2">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) => (
            <Paper elevation={4} sx={{borderRadius: "20px"}} key={order.id} className="bg-white p-3 sm:p-6 ml-1 shadow-md">
              {/* Order Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg sm:text-xl font-medium">
                    Order ID: {order.id} | Type: {order.order_type}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600">
                    Payment: {order.payment_type} | Total: ${order.total_amount}
                  </p>
                </div>
                <button onClick={() => openModal(order)}>
                  <FaEye className="h-6 w-6 text-gray-500 hover:text-primary transition-colors duration-200" />
                </button>
              </div>
            </Paper>
          ))
        ) : (
          <p className="text-center text-gray-600">No orders found!</p>
        )}     
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            <FaBackward className="h-5 w-5 text-secondary" />
          </button>
          <span className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 rounded">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            <FaForward className="h-5 w-5 text-secondary" />
          </button>
        </div>
      )}

      {/* Modal for Order Details */}
      {isModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={closeModal}
        >
          {/* Main Modal Container */}
          <div
            className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-11/12 max-w-lg sm:max-w-xl md:max-w-2xl relative"
            onClick={(e) => e.stopPropagation()} // Prevents modal close on inside click
          >
            {/* Close Button */}
            <button
              className="absolute -top-4 -right-4 bg-white border border-gray-300 rounded-full text-red-500 p-2 shadow-md hover:bg-gray-100"
              onClick={closeModal}
            >
              <MdClose className="text-2xl" />
            </button>

            {/* Order Details Heading */}
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-center sm:text-left">Order Details</h2>

            {/* Order Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="font-medium">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium">{selectedOrder.order_type}</p>
              </div>
              {selectedOrder?.customerId?.name && (
                <div>
                  <p className="text-gray-500">Customer Name</p>
                  <p className="font-medium">{selectedOrder.customerId.name}</p>
                </div>
              )}
              {selectedOrder?.customerId?.phone && (
                <div>
                  <p className="text-gray-500">Customer Phone</p>
                  <p className="font-medium">{selectedOrder.customerId.phone}</p>
                </div>
              )}
              {selectedOrder?.tableId?.table_number && (
                <div>
                  <p className="text-gray-500">Table Number</p>
                  <p className="font-medium">{selectedOrder.tableId.table_number}</p>
                </div>
              )}
              {selectedOrder?.waiterId?.name && (
                <div>
                  <p className="text-gray-500">Waiter Name</p>
                  <p className="font-medium">{selectedOrder.waiterId.name}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Total Amount</p>
                <p className="font-medium">
                  ${Number(selectedOrder.total_amount).toFixed(2)} (${(Number(selectedOrder.total_amount) - Number(selectedOrder.total_amount) / 1.09).toFixed(2)} GST)
                </p>
              </div>
              <div>
                <p className="text-gray-500">Discount</p>
                <p className="font-medium">{selectedOrder.discount ?? 0}%</p>
              </div>
              {selectedOrder.payment_type && (
                <div>
                  <p className="text-gray-500">Payment Type</p>
                  <p className="font-medium">{selectedOrder.payment_type.toUpperCase()}</p>
                </div>
              )}
              {selectedOrder.transaction_id && (
                <div>
                  <p className="text-gray-500">Transaction ID</p>
                  <p className="font-medium">{selectedOrder.transaction_id || "N/A"}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium"> {new Date(selectedOrder.updated_at).toLocaleDateString("en-GB")}</p>
              </div>
            </div>

            {/* Proof Image */}
            {selectedOrder.proof && (
              <div className="mt-4">
                <p className="text-gray-500 text-sm sm:text-base mb-2">Proof Image</p>
                <img
                  src={`${api.defaults.baseURL}/${selectedOrder.proof.replace(/\\/g, "/")}`}
                  alt="Proof"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setFullScreenImage(selectedOrder.proof)}
                  onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                />
              </div>
            )}

            {/* Order Items List */}
            <div className="mt-4">
              <p className="text-sm sm:text-base font-semibold mb-2">Ordered Items</p>
              <div className="max-h-40 sm:max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b last:border-none pb-2"
                  >
                    <span className="text-gray-700 font-medium">
                      {item.itemName} x {item.quantity}
                    </span>
                    <span className="text-gray-800 font-semibold">${item.itemPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fullscreen Proof Image Modal */}
          {fullScreenImage && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
              onClick={() => setFullScreenImage(null)}
            >
              <img
                src={`${api.defaults.baseURL}/${fullScreenImage.replace(/\\/g, "/")}`}
                alt="Proof"
                className="max-w-full max-h-full p-2"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;