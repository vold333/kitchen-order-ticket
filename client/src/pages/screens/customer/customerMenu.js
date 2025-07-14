import React, { useState, useEffect } from "react";
import { MdLogout } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { IoMdCart, IoMdClose } from "react-icons/io";
import { BsCash, BsQrCodeScan } from "react-icons/bs";
import { IoCardOutline } from "react-icons/io5";
import qrImage from "../../../assets/images/qr.png";
import api from "../../../services/api";
import Paper from '@mui/material/Paper';

const CustomerMenu = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTransactionFields, setShowTransactionFields] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const location = useLocation();
  const { customer_id } = location.state;

  // State for categories and menu items
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState({});

  // Fetch categories and menu items on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/category/unauth/all");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchMenuItems = async () => {
      try {
        const response = await api.get("/items/unauth/all");
        const groupedItems = response.data.reduce((acc, item) => {
          if (!acc[item.category_id]) acc[item.category_id] = [];
          acc[item.category_id].push(item);
          return acc;
        }, {});
        setMenuItems(groupedItems);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };

    fetchCategories();
    fetchMenuItems();
  }, []);

  const handleFileChange = (e) => {
    setScreenshot(e.target.files[0]);
  };
  
  const allItems = Object.values(menuItems).flat();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    try {   
      const formData = new FormData();

      // Step 1: Create the order
      formData.append("customer_id", customer_id);
      formData.append("order_type", "takeaway");
      formData.append("total_amount", 0); // Initial value
      formData.append("payment_type", selectedPayment);
      if (selectedPayment === "qr") {
        formData.append("transaction_id", transactionId);
        formData.append("proof", screenshot);
      }

      const orderResponse = await api.post("/orders/unauth/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
      });

      const { id: order_id } = orderResponse.data;

      // Step 2: Add items to the order
      const itemsToCreate = cart.map((item) => ({
        order_id,
        item_id: item.id,
        quantity: item.quantity,
        price: item.price * item.quantity, // Total price for the quantity
      }));

      await api.post("/orderItems/unauth/create", itemsToCreate);

      // Step 3: Update the total amount
      const subtotal = calculateTotal();
      const gst = subtotal * 0.09; // Calculate GST (9%)
      const totalAmount = subtotal + gst; // Add GST to the subtotal
      
      await api.put(`/orders/unauth/update/${order_id}`, {
        total_amount: totalAmount,
      });

      toast.success("Order placed successfully!");
      setCart([]); // Clear the cart
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place the order. Please try again.");
    }
  };

  const qrModal = () => {
    if (selectedPayment) {
      setShowModal(true);
    }
  }

  const closeModal = () => {
    setShowModal(false);
  };

  const renderModalContent = () => {
    if (selectedPayment === "qr") {

      return (
        <div>
          <div className="flex flex-col items-center space-y-4 font-sans">
            <p className="text-center">Scan the below QR code and pay</p>
            <img src={qrImage} alt="QR Code" className="w-40 h-40 md:w-32 md:h-32" />
            <p className="text-center">Note: Please ensure you record the transaction ID and capture a screenshot of the payment screen.</p>

            {!showTransactionFields ? (
              <button
                type="button"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
                onClick={() => setShowTransactionFields(true)}
              >
                Continue
              </button>
            ) : (
              <div className="w-full space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Transaction ID</label>
                  <input
                    type="text"
                    placeholder="Enter transaction ID"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Upload Payment Screenshot</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    onChange={handleFileChange}
                  />
                </div>

                <button
                  type="button"
                  className={`w-full bg-primary hover:bg-blue-300 py-3 rounded-xl font-semibold transition-all ${
                    !transactionId || !screenshot ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!transactionId || !screenshot}
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  const handleAddToCart = (item) => {
    setCart((prevCart) => [
      ...prevCart,
      { ...item, quantity: 1 }, 
    ]);
  };

  const handleIncreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    );
  };

  const handleDecreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((cartItem) =>
          cartItem.id === id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    );
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const filteredItems = (selectedCategory === "all" ? allItems : menuItems[selectedCategory] || []).filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = calculateTotal();
  const gst = subtotal * 0.09;
  const total = subtotal + gst;

  return (
    <div className="min-h-screen font-sans bg-tertiary">
      {/* Header */}
      <header className="w-full bg-tertiary py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl md:text-2xl xl:text-3xl font-bold text-secondary">Select Menu</h1>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-12 h-12 bg-white text-secondary rounded-full hover:text-red-600 transition duration-300"
        >
          <MdLogout className="text-2xl" />
        </button>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Left Side: Categories and Menu */}
        <div className="w-full lg:w-3/4 pb-4 pl-4 pr-4">
          {/* Search Bar */}
          <div className="mb-4 flex items-center space-x-2">
            <FaSearch className="text-gray-500 text-xl" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Categories */}
          <div className="flex overflow-x-auto space-x-4 mb-4 pb-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
          <Paper elevation={3} sx={{borderRadius: "15px"}}
              className={`flex flex-col ml-2 items-center min-w-[7rem] md:min-w-[6.5rem] lg:min-w-[6rem] xl:min-w-[8rem] 
                h-24 md:h-20 lg:h-18 xl:h-28  justify-center border rounded-xl shadow-md transition-all ${
                selectedCategory === "all" ? "bg-primary" : "bg-white text-black"
              }`}
              onClick={() => setSelectedCategory("all")}
            >
              <span className="font-medium text-base md:text-sm lg:text-sm xl:text-base text-secondary">All</span>
              <span className="text-xs md:text-sm lg:text-sm xl:text-sm text-gray-600">({allItems.length})</span>
            </Paper>
        
            {categories.map((category) => (
              <Paper elevation={3} sx={{borderRadius: "15px"}}
                key={category.id}
                className={`flex flex-col items-center 
                min-w-[7rem] md:min-w-[6.5rem] lg:min-w-[6rem] xl:min-w-[8rem] 
                h-24 md:h-20 lg:h-18 xl:h-28 
                justify-center border rounded-xl shadow-md transition-all 
                ${
                  selectedCategory === category.id ? "bg-primary" : "bg-white text-black"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="font-medium text-base md:text-sm lg:text-sm xl:text-base text-secondary">
                  {category.name}
                </span>
                <span className="text-sm text-gray-600">
                  ({menuItems[category.id]?.length || 0})
                </span>
              </Paper>
            ))}
          </div>

          {/* Menu Items */}        
          <div className="grid 
            grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 
            gap-3 sm:gap-4 md:gap-5 lg:gap-3 
            sm:max-h-[40vh] md:max-h-[30vh] lg:max-h-[68vh] xl:max-h-[68vh] 
            overflow-y-auto px-2 md:px-4 lg:px-2"
          > 
            {filteredItems.map((item) => {
              const cartItem = cart.find((cartItem) => cartItem.id === item.id);

              return (
                <Paper elevation={4} sx={{borderRadius: "20px"}}
                  key={item.id}
                  className="border mb-1 ml-1 p-2 sm:p-3 md:p-4 lg:p-3 bg-white 
                  rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl shadow-md 
                  hover:shadow-lg md:hover:shadow-xl lg:hover:shadow-2xl 
                  transition-all duration-300"
                >
                  <div className="relative">
                  {item.image ? (
                    <img
                      src={`${api.defaults.baseURL}/${item.image.replace(/\\/g, "/")}`}
                      alt={item.name}
                      className="w-full 
                        h-32 sm:h-36 md:h-28 lg:h-36 xl:h-48 
                        rounded-md sm:rounded-lg md:rounded-xl object-cover mb-1 sm:mb-2"
                    />
                  ) : (
                      <div className="w-full h-32 sm:h-36 md:h-28 lg:h-36 xl:h-48 object-cover mb-1 sm:mb-2 rounded-xl bg-gray-300 flex items-center justify-center text-gray-600">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-0 right-0 bg-white rounded-bl-full p-1 sm:p-2 shadow-md">
                      <p className="ml-1 sm:ml-2 text-sm sm:text-base md:text-base text-secondary font-semibold">
                        ${item.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-secondary">
                      {item.name}
                    </h3>
                  </div>

                  {cartItem ? (
                    <div className="mt-2 bg-gray-200 
                      px-3 sm:px-4 md:px-5 py-1 rounded-full w-full 
                      flex items-center justify-between shadow-md"
                    >
                      <button
                        onClick={() => handleDecreaseQuantity(item.id)}
                        className="bg-red-500 text-white font-bold 
                        p-1 rounded-full hover:bg-red-600 transition"
                      >
                        <FaMinus />
                      </button>
                      <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => handleIncreaseQuantity(item.id)}
                        className="bg-green-500 text-white font-bold 
                        p-1 rounded-full hover:bg-green-600 transition"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="mt-1 py-1 bg-primary 
                        px-3 sm:px-4 md:py-2 rounded-full w-full 
                        shadow-md hover:bg-blue-300 text-secondary transition 
                        flex items-center justify-center space-x-1 sm:space-x-2"
                    >
                      <FaShoppingCart className="text-sm sm:text-base md:text-lg lg:text-sm xl:text-base" />
                      <span className="text-xs sm:text-sm md:text-base lg:text-sm xl:text-base">Add</span>
                    </button>
                  )}
                </Paper>
              );
            })}
          </div>
        </div>

        {/* Right Side: Cart and Checkout */}
        <div className="w-full lg:w-1/4 p-4 bg-white shadow-lg rounded-xl flex flex-col justify-between">
          <h2 className="text-2xl lg:text-xl font-bold mb-3 text-gray-800">Your Cart</h2>
          <div className="flex-grow overflow-y-auto max-h-[50vh] md:max-h-[17vh] lg:max-h-[45vh]">

          {cart.length > 0 ? (
            <ul className="space-y-6">
              {cart.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-100 rounded-xl shadow-md p-2"
                >
                  <div className="flex items-center space-x-4">
                    {item.image ? (
                    <img
                      src={`${api.defaults.baseURL}/${item.image.replace(/\\/g, "/")}`}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg hidden xl:block object-cover"
                    />
                      ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-300 flex items-center justify-center text-gray-600">
                        No Img
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800 text-lg lg:text-base">{item.name}</p>
                      <p className="text-base text-gray-600">${item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDecreaseQuantity(item.id)}
                      className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold hover:bg-red-600"
                    >
                      <FaMinus />
                    </button>
                    <span className="font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleIncreaseQuantity(item.id)}
                      className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold hover:bg-green-600"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 space-y-2">
              <IoMdCart className="w-32 h-32 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto text-black" />
              <p className="text-xl lg:text-lg font-medium">Your cart is empty!</p>        
            </div>
          )}
        </div>

          {/* Total Summary */}
          <div className="mt-6 border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">GST (9%)</span>
                <span className="text-gray-800">${gst.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 border-t pt-4">
              <h3 className="text-lg font-bold">Total</h3>
              <p className="text-xl font-extrabold">${total.toFixed(2)}</p>
            </div>

            {/* Payment Method */}
            <div className="mt-6 lg:mt-3">
              <h4 className="text-lg font-medium text-gray-700 mb-2">Payment Method</h4>
              <div className="flex justify-around gap-4">
                <button
                  className={`py-2 px-4 w-32 rounded-xl flex flex-col items-center border shadow-md ${
                    selectedPayment === "cash"
                      ? "bg-primary"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-primary"
                  }`}
                  onClick={() => {setSelectedPayment("cash")}}
                >
                  <BsCash className="text-2xl mb-1" />
                  <span className="text-sm">Cash</span>
                </button>

                <button
                   className={`py-2 px-4 w-32 rounded-xl flex flex-col items-center border shadow-md ${
                    selectedPayment === "card"
                      ? "bg-primary"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-primary"
                   }`}
                  onClick={() => setSelectedPayment("card")}
                >
                  <IoCardOutline className="text-2xl mb-1" />
                  <span className="text-sm">Card</span>
                </button>

                <button
                  className={`py-2 px-4 w-32 rounded-xl flex flex-col items-center border shadow-md ${
                    selectedPayment === "qr"
                      ? "bg-primary"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-primary"
                  }`}
                  onClick={() => {
                    setSelectedPayment("qr");                    
                  }}
                >
                  <BsQrCodeScan className="text-2xl mb-1" />
                  <span className="text-sm">QR</span>
                </button>
              </div>
            </div>

            <button
              className={`mt-4 w-full ${
                selectedPayment === "qr" ? "bg-primary text-secondary hover:bg-secondary hover:text-white" : "bg-primary hover:bg-blue-300"
              } py-3 rounded-xl transition-all ${
                cart.length === 0 || !selectedPayment ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={cart.length === 0 || !selectedPayment}
              onClick={selectedPayment === "qr" ? qrModal : handlePlaceOrder} 
            >
              {selectedPayment === "qr" ? "Scan to Pay" : "Place Order"}
            </button>
          </div>
        </div>
      </div>

        {/* Modal Popup */}          
        {showModal && selectedPayment === "qr" && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
            <div className="bg-white rounded-xl p-6 w-96 max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  QR Payment
                </h2>
                <button onClick={closeModal} className="text-gray-600 text-xl">
                  <IoMdClose />
                </button>
              </div>
              {renderModalContent()}              
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

export default CustomerMenu;
