import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, Cell } from "recharts";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Paper } from "@mui/material";

const Report = () => {
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    orderType: "",
    paymentType: "",
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(true);

  const orderTypeOptions = [
    { label: "All Order Types", value: "" },
    { label: "Dine-In", value: "dine_in" },
    { label: "Takeaway", value: "takeaway" }
  ];

  const paymentTypeOptions = [
    { label: "All Payment Types", value: "" },
    { label: "Cash", value: "cash" },
    { label: "Card", value: "card" },
    { label: "QR", value: "qr" },
    { label: "FOC", value: "foc" }
  ];

  const pieColors = ["#344CB7", "#ef4444", "#ffc658", "#4AA924", "#FD8B51"];

  useEffect(() => {
    fetchOrders();
    fetchOrderItems();
    fetchItems();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/all");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async () => {
    try {
      const response = await api.get("/orderItems/all");
      setOrderItems(response.data);
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get("/items/all");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // Filter orders by date range
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.created_at.split("T")[0]);
    const isWithinDateRange =
      (!filters.startDate || orderDate >= filters.startDate) &&
      (!filters.endDate || orderDate <= filters.endDate);

    return (
      isWithinDateRange &&
      (!filters.orderType || order.order_type === filters.orderType) &&
      (!filters.paymentType || order.payment_type === filters.paymentType)
    );
  });

  const totalSales = filteredOrders.reduce(
    (sum, order) => sum + parseFloat(order.total_amount),
    0
  );

  const filteredOrderItems = orderItems.filter((orderItem) => {
    const order = orders.find((order) => order.id === orderItem.order_id); // Find the corresponding order
    if (!order) return false;

    const orderDate = new Date(order.created_at.split("T")[0]);
    const isWithinDateRange =
      (!filters.startDate || orderDate >= filters.startDate) &&
      (!filters.endDate || orderDate <= filters.endDate);

    return (
      isWithinDateRange &&
      (!filters.orderType || order.order_type === filters.orderType) &&
      (!filters.paymentType || order.payment_type === filters.paymentType)
    );
  });

  // Calculate top 5 most ordered items from filteredOrderItems
  const topOrderedItems = filteredOrderItems.reduce((acc, orderItem) => {
    const itemId = orderItem.item_id;
    acc[itemId] = (acc[itemId] || 0) + orderItem.quantity;
    return acc;
  }, {});

  const topOrderedItemsData = Object.entries(topOrderedItems)
    .sort((a, b) => b[1] - a[1]) // Sort by total quantity
    .slice(0, 5) // Take top 5
    .map(([itemId, totalQuantity]) => {
      const item = items.find((item) => item.id === parseInt(itemId));
      return {
        name: item?.name || "Unknown Item",
        TotalQuantity: totalQuantity,
      };
    });

  const dineInSales = filteredOrders
    .filter((order) => order.order_type === "dine_in")
    .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

  const takeawaySales = filteredOrders
    .filter((order) => order.order_type === "takeaway")
    .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

  const paymentBreakdown = filteredOrders.reduce((acc, order) => {
    acc[order.payment_type] =
      (acc[order.payment_type] || 0) + parseFloat(order.total_amount);
    return acc;
  }, {});

  const waiterOrders = filteredOrders.reduce((acc, order) => {
    if (order.waiterId) {
      acc[order.waiterId.name] = (acc[order.waiterId.name] || 0) + 1;
    }
    return acc;
  }, {});

  const repeatedCustomers = filteredOrders.reduce((acc, order) => {
    if (order.customerId) {
      acc[order.customerId.name] = (acc[order.customerId.name] || 0) + 1;
    }
    return acc;
  }, {});

  const highPayCustomers = filteredOrders.reduce((acc, order) => {
    if (order.customerId) {
      acc[order.customerId.name] =
        (acc[order.customerId.name] || 0) + parseFloat(order.total_amount);
    }
    return acc;
  }, {});

  const dateWiseSales = filteredOrders.reduce((acc, order) => {
    const date = order.created_at.split("T")[0];
    acc[date] = (acc[date] || 0) + parseFloat(order.total_amount);
    return acc;
  }, {});

  // Convert objects to arrays for Recharts
  const paymentBreakdownData = Object.entries(paymentBreakdown).map(
    ([type, amount]) => ({
      name: type.toUpperCase(),
      value: parseFloat(amount.toFixed(2)),
    })
  );

  const waiterPerformanceData = Object.entries(waiterOrders).map(
    ([waiter, count]) => ({
      name: waiter,
      Orders: count,
    })
  );

  const dateWiseSalesData = Object.entries(dateWiseSales).map(
    ([date, amount]) => ({
      name: date,
      Sales: parseFloat(amount.toFixed(2)),
    })
  );

  const topRepeatedCustomersData = Object.entries(repeatedCustomers)
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, 3) // Take top 3
    .map(([customer, count]) => ({
      name: customer,
      Orders: count,
    }));

  const topHighPayCustomersData = Object.entries(highPayCustomers)
    .sort((a, b) => b[1] - a[1]) // Sort by total amount
    .slice(0, 3) // Take top 3
    .map(([customer, amount]) => ({
      name: customer,
      Amount: parseFloat(amount.toFixed(2)),
    }));

  // Export to Excel
  const exportToExcel = () => {
    const worksheetData = filteredOrders.map((order) => ({
      OrderID: order.id,
      Customer: order.customerId?.name || "N/A",
      Waiter: order.waiterId?.name || "N/A",
      OrderType: order.order_type,
      PaymentType: order.payment_type,
      TotalAmount: order.total_amount,
      Date: order.created_at.split("T")[0],
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders_report.xlsx");
  };

  return (
    <div className="pb-4 pl-4 pr-4 pt-2 bg-gray-200 h-full">

      <h2 className="mb-3 text-center text-secondary text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-4xl font-bold">
        Dashboard
      </h2>

        <Paper elevation={4} sx={{borderRadius: "20px"}} className="bg-white p-4 rounded-lg shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
          <div className="flex flex-col justify-center items-center p-1 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold mb-2">Total Sales</h2>
            <div className="grid grid-cols-3 gap-4 w-full text-center">
              <div>
                <p className="text-xl sm:text-xl md:text-2xl font-bold text-green-600">${totalSales.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Overall Sales</p>
              </div>
              <div>
                <p className="text-xl sm:text-lg md:text-xl font-medium text-blue-500">${dineInSales.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Dine-In</p>
              </div>
              <div>
                <p className="text-xl sm:text-lg md:text-xl font-medium text-orange-500">${takeawaySales.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Takeaway</p>
              </div>
            </div>
          </div>
          
          {/* Filters Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              
              {/* Order Type */}        
              <Autocomplete
                disablePortal
                options={orderTypeOptions}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value}
                value={orderTypeOptions.find(option => option.value === filters.orderType) || null}
                onChange={(event, newValue) => setFilters({ ...filters, orderType: newValue?.value || "" })}
                sx={{ width: 140 }}
                disableClearable
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Order Type"
                    inputProps={{ ...params.inputProps, readOnly: true }}
                  />
                )}
              />

              {/* Payment Type */}        
              <Autocomplete
                disablePortal
                options={paymentTypeOptions}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value}
                value={paymentTypeOptions.find(option => option.value === filters.paymentType) || null}
                onChange={(event, newValue) => setFilters({ ...filters, paymentType: newValue?.value || "" })}
                sx={{ width: 140 }}
                disableClearable
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Payment Type"
                    inputProps={{ ...params.inputProps, readOnly: true }}
                  />
                )}
              />

              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date) => setFilters({ ...filters, startDate: date })}
                  selectsStart
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  className="p-2 border rounded-lg w-full"
                  placeholderText="Start Date"
                />
                <DatePicker
                  selected={filters.endDate}
                  onChange={(date) => setFilters({ ...filters, endDate: date })}
                  selectsEnd
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  minDate={filters.startDate}
                  className="p-2 border rounded-lg w-full"
                  placeholderText="End Date"
                />
                {/* Clear Dates Button */}
                {(filters.startDate || filters.endDate) && (
                  <button
                    onClick={() => setFilters({ ...filters, startDate: null, endDate: null })}
                    className="text-red-500 text-sm font-medium"
                  >
                    ❌ Clear
                  </button>
                )}
              </div>
      
              <button
                onClick={exportToExcel}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 flex items-center gap-2 w-min"
              >
                <Download size={18} /> Report
              </button>
            </div>
          </div>
        </div>
      </Paper>

      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Main Content Grid */}
      {!loading && (
        <div className="overflow-y-auto max-h-[66vh]">
          <div className="grid grid-cols-1 p-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">

            {/* Payment Breakdown (Pie Chart) */}
            <Paper elevation={4} sx={{borderRadius: "20px"}} className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Payment Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentBreakdownData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {paymentBreakdownData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>

            {/* Date-wise Sales (Line Chart) */}
            <Paper elevation={4} sx={{borderRadius: "20px"}} className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Date-wise Sales
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dateWiseSalesData}>                  

                  {/* Grid & Axis Customization */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" tick={{ fill: "#555" }} />
                  <YAxis tick={{ fill: "#555" }} />

                  {/* Tooltip & Legend */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />

                  {/* Styled Line */}
                  <Line
                    type="monotone"
                    dataKey="Sales"
                    stroke="#344CB7"
                    strokeWidth={3}
                    dot={{
                      fill: "#344CB7",
                      r: 6,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 10 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            {/* Top 5 Most Ordered Items (Bar Chart) */}
            <Paper elevation={4} sx={{borderRadius: "20px"}} className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                Top 5 Most Ordered Items
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topOrderedItemsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="TotalQuantity" fill="url(#colorGradient)" />
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Waiter Performance (Bar Chart) */}
            <Paper elevation={4} sx={{borderRadius: "20px"}} className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Waiter Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={waiterPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Orders" fill="url(#colorGradient1)" />
                  <defs>
                    <linearGradient
                      id="colorGradient1"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* Repeated Customers (Bar Chart) */}
            <Paper elevation={4} sx={{borderRadius: "20px"}} className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Repeated Customers</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topRepeatedCustomersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Orders" fill="url(#colorGradient2)" />
                  <defs>
                    <linearGradient
                      id="colorGradient2"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* High Paying Customers (Bar Chart) */}
            <Paper elevation={4} sx={{borderRadius: "20px"}} className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                High Paying Customers
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topHighPayCustomersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Amount" fill="url(#colorGradient3)" />
                  <defs>
                    <linearGradient
                      id="colorGradient3"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6b21a8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;