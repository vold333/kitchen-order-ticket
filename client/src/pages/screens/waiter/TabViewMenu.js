import React, { useState, useEffect } from "react";
import { MdClose, MdLogout } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import useLogout from "../../../services/logout";
import api from "../../../services/api";
import Paper from '@mui/material/Paper';
import { LuClipboardList } from "react-icons/lu";

const DesktopView = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const logout = useLogout();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [discount, setDiscount] = useState(0);
  const [cookingComments, setCookingComments] = useState({});
  const [selectedItemForComments, setSelectedItemForComments] = useState(null);
  const [selectedComments, setSelectedComments] = useState({});
  
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const tableId = queryParams.get("tableId");

  const user = JSON.parse(localStorage.getItem('user'));
  const waiterId = user?.id; // This is the logged-in waiter's ID

  // State for categories and menu items
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState({});

  // Fetch categories and menu items on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/category/all");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchMenuItems = async () => {
      try {
        const response = await api.get("/items/all");
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

    const fetchCookingComments = async () => {
      try {
        const response = await api.get("/cook-comments/all");
        const groupedComments = response.data.data.reduce((acc, comment) => {
          if (!acc[comment.category_id]) acc[comment.category_id] = [];
          acc[comment.category_id].push(comment);
          return acc;
        }, {});
        setCookingComments(groupedComments);
      } catch (error) {
        console.error("Error fetching cooking comments:", error);
      }
    }; 

    fetchCategories();
    fetchMenuItems();
    fetchCookingComments();
  }, []);

  const handleOpenCommentsModal = (item) => {
    setSelectedItemForComments(item);
  };
  
  const handleSelectComment = (commentId) => {
    setSelectedComments((prev) => {
      const currentSelection = prev[selectedItemForComments.id] || [];
      if (currentSelection.includes(commentId)) {
        return { 
          ...prev, 
          [selectedItemForComments.id]: currentSelection.filter((id) => id !== commentId) 
        };
      } else {
        return { 
          ...prev, 
          [selectedItemForComments.id]: [...currentSelection, commentId] 
        };
      }
    });
  };
  
  const allItems = Object.values(menuItems).flat();

  const calculateTotal = (discount = 0) => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const gst = subtotal * 0.09; // GST is 9%
    const totalBeforeDiscount = subtotal + gst;
    const discountAmount = totalBeforeDiscount * (discount / 100); // Calculate discount
    const finalTotal = totalBeforeDiscount - discountAmount; // Apply discount
  
    return { subtotal, gst, discountAmount, finalTotal };
  };
  
  // Function to handle printing the kitchen receipt
  const handlePrintKitchenReceipt = async (order_id, order_type, table_id, cartItems) => {
    const now = new Date();
    const dateTime = now.toLocaleString(); // Format as needed

    try {
      // Fetch table details to get the table_number
      const tableResponse = await api.get(`/tables/${table_id}`);
      const table_number = tableResponse.data.table_number; 

      const receiptData = {
        order_id,
        order_type,
        table_number, // Use table_number instead of table_id
        date_time: dateTime,
        items: cartItems.map((item) => ({
          name: item.name, // Using item.name from your fetched menu data
          quantity: item.quantity,
          special_request: item.special_request || "",
        })),
      };

      console.log("📝 Kitchen Receipt Payload:", JSON.stringify(receiptData, null, 2)); // Debugging

      await api.post("/print/kitchen", receiptData);
      console.log("Kitchen receipt printed successfully.");
    } catch (error) {
      console.error("Error fetching table number or printing kitchen receipt:", error);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const formData = new FormData();
      formData.append("table_id", tableId);
      formData.append("waiter_id", waiterId);
      formData.append("order_type", "dine_in");
      formData.append("total_amount", finalTotal.toFixed(2)); // Store total after discount
      formData.append("discount", discount); // Store discount %
  
      const orderResponse = await api.post("/orders/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      const { id: order_id } = orderResponse.data;

      const updatedItems = cart.map((item) => {
        const commentIds = selectedComments[item.id] || []; // Get selected comment IDs
    
        // Find the category's comments from cookingComments
        const categoryComments = cookingComments[item.category_id] || [];
    
        // Convert IDs to comment text
        const commentTexts = commentIds
          .map((commentId) => {
            const comment = categoryComments.find((c) => c.id === commentId);
            return comment ? comment.comments : null;
          })
          .filter(Boolean); // Remove any null values
    
        return {
          order_id,
          item_id: item.id,
            name: item.name,
          quantity: item.quantity,
          price: item.price * item.quantity,
          special_request: commentTexts.length > 0 ? commentTexts.join(", ") : "",
        };
      });   
  
      await api.post("/orderItems/create", updatedItems);
  
      await handlePrintKitchenReceipt(order_id, "DINE-IN", tableId, updatedItems);
      
      toast.success("Order placed successfully!");
      setCart([]);
      navigate("/waiter");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place the order. Please try again.");
    }
  };

  const { subtotal, gst, discountAmount, finalTotal } = calculateTotal(discount);

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

  const filteredItems = (selectedCategory === "all" ? allItems : menuItems[selectedCategory] || []).filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen font-sans bg-tertiary">
      
      {/* Header */}
      <header className="w-full bg-tertiary py-4 px-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/waiter')}
          className="flex items-center justify-center w-12 h-12 bg-white text-secondary rounded-full hover:text-blue-600 transition duration-300"
        >
          <IoArrowBack className="text-2xl" />
        </button>
        <h1 className="text-2xl sm:text-3xl md:text-2xl xl:text-3xl font-bold text-secondary">Select Menu</h1>
        <button
          onClick={logout}
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
                   <button
                      className="ml-3 mr-2 px-2 py-1 bg-primary text-xs rounded-full"
                      onClick={() => handleOpenCommentsModal(item)}
                    >
                      <LuClipboardList className="text-lg text-secondary" />
                    </button>
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
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount (%)</span>
              <input
                type="number"
                min="0"
                max="15"
                value={discount}
                onChange={(e) => setDiscount(Math.min(15, Math.max(0, Number(e.target.value))))}
                className="w-11 p-1 text-center border rounded-lg"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount Amount</span>
              <span className="text-gray-800">- ${discountAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 border-t pt-4">
            <h3 className="text-lg font-bold">Total</h3>
            <p className="text-xl font-extrabold">${finalTotal.toFixed(2)}</p>
          </div>

            <button
              className={`mt-4 w-full font-semibold bg-primary hover:bg-blue-300 py-3 rounded-xl transition-all ${
                cart.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={cart.length === 0}
              onClick={handlePlaceOrder} 
            >
              Place Order
            </button>
          </div>
        </div>
      </div>   
      {selectedItemForComments && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                onClick={() => setSelectedItemForComments(null)}
              >
                <div
                  className="bg-white p-6 rounded-lg shadow-lg w-10/12 max-w-md relative"
                  onClick={(e) => e.stopPropagation()}
                >
      
                 {/* Close Button */}
                 <button
                    className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 text-red-500 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                    onClick={() =>  setSelectedItemForComments(null)}
                  >
                    <MdClose className="text-2xl" />
                  </button>          
      
                  <h3 className="text-lg font-bold mb-4">
                    Cooking Notes for {selectedItemForComments.name}
                  </h3>
      
                  <div className="max-h-72 overflow-y-auto border rounded p-2">
                    <ul>
                      {cookingComments[selectedItemForComments.category_id]?.map((comment) => (
                        <li key={comment.id} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={selectedComments[selectedItemForComments.id]?.includes(comment.id)}
                            onChange={() => handleSelectComment(comment.id)}
                            className="mr-2"
                          />
                          <span>{comment.comments}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
      
                  <button
                    className="mt-4 w-full bg-primary text-secondary font-bold py-2 rounded-lg"
                    onClick={() => setSelectedItemForComments(null)}
                  >
                    Save
                  </button>
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

export default DesktopView;
