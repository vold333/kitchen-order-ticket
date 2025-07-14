import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdAdd, MdLogout, MdShoppingCart, MdClose, MdRemove } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { IoArrowBack } from "react-icons/io5";
import useLogout from "../../../services/logout";
import api from "../../../services/api";
import { TextField } from "@mui/material";
import { LuClipboardList } from "react-icons/lu";

function UpdateMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const { orderId } = location.state || {};

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [discount, setDiscount] = useState(0);
  const [cookingComments, setCookingComments] = useState({});
  const [selectedItemForComments, setSelectedItemForComments] = useState(null);
  const [selectedComments, setSelectedComments] = useState({});

  const queryParams = new URLSearchParams(location.search);
  const tableId = queryParams.get("tableId");

  // State for categories and menu items
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [currentOrder, setCurrentOrder] = useState(null);

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

    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setCurrentOrder(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
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
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    if (currentOrder && currentOrder.discount !== undefined) {
      setDiscount(currentOrder.discount);
    }
  }, [currentOrder]);

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

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleAddToCart = (item) => {
    const exists = selectedItems.find((i) => i.id === item.id);
    if (exists) {
      setSelectedItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems((prev) => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (id, delta) => {
    setSelectedItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
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

  const handleUpdateOrder = async () => {
    if (selectedItems.length === 0) {
      toast.error("Your cart is empty!", { autoClose: 1500 });
      return;
    }

    try {
      // Step 1: Add items to the existing order
      const updatedItems = selectedItems.map((item) => {
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
          order_id: orderId,
          item_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price * item.quantity,
          special_request: commentTexts.length > 0 ? commentTexts.join(", ") : "",
        };
      }); 

      await api.post("/orderItems/create", updatedItems);

      // Step 2: Update the total amount
      const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const gst = subtotal * 0.09; // 9% GST
        const totalBeforeDiscount = subtotal + gst;
        const discountAmount = totalBeforeDiscount * (discount / 100);
        const finalTotal = totalBeforeDiscount - discountAmount; // Apply discount
        const grandTotal = finalTotal + parseFloat(currentOrder.total_amount);

      await api.put(`/orders/update/${orderId}`, {
        total_amount: grandTotal.toFixed(2),
        discount: discount, // Store discount in DB 
      });

      await handlePrintKitchenReceipt(orderId, "DINE-IN", tableId, updatedItems);
      toast.success("Order updated successfully!", { autoClose: 1500 });
      setSelectedItems([]); // Clear the cart
      setCartOpen(false);

        // Navigate to Waiter Page after success
        // setTimeout(() => {
        //   navigate("/waiter");
        // }, 1500);

        await new Promise((resolve) => setTimeout(resolve, 1500));
        navigate("/waiter");

    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update the order. Please try again.", {
        autoClose: 1500,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Header */}
      <header className="w-full bg-tertiary py-3 px-3 flex justify-between items-center">
        <button
          onClick={() => navigate("/waiter/manage-orders")}
          className="flex items-center justify-center w-10 h-10 bg-white text-secondary rounded-full hover:text-blue-600 transition duration-300"
        >
          <IoArrowBack className="text-2xl" />
        </button>
        <h1 className="text-xl sm:text-xl md:text-2xl xl:text-3xl font-bold text-secondary">Select Menu</h1>
        <button
          onClick={logout}
          className="flex items-center justify-center w-10 h-10 bg-white text-secondary rounded-full hover:text-red-600 transition duration-300"
        >
          <MdLogout className="text-2xl" />
        </button>
      </header>

      {/* Categories */}
      <div className="flex-grow p-4">
        <h2 className="text-lg font-semibold mb-4 text-secondary">Categories</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              className="p-4 bg-tertiary text-center rounded-lg font-bold text-secondary hover:bg-blue-200"
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Cart Icon */}
      <button
        className="fixed bottom-4 right-4 bg-tertiary text-secondary p-4 rounded-full shadow-lg"
        onClick={() => setCartOpen(true)}
      >
        <MdShoppingCart className="text-2xl" />
        {selectedItems.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {selectedItems.length}
          </span>
        )}
      </button>

      {/* Category Modal */}
      {selectedCategory && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedCategory(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-10/12 max-w-3xl relative"
            onClick={(e) => e.stopPropagation()} // Prevent overlay click from closing modal
          >
            {/* Close Button */}
            <button
              className="absolute -top-4 -right-4 bg-white border border-gray-300 rounded-full text-red-500 p-2 shadow-md hover:bg-gray-100"
              onClick={() => setSelectedCategory(null)}
            >
              <MdClose className="text-2xl" />
            </button>

            {/* Category Title */}
            <h3 className="text-xl font-bold mb-4 text-secondary">
              {categories.find((c) => c.id === selectedCategory)?.name}
            </h3>

            {/* Search Bar */}
            <div className="relative w-full mb-4">
              <TextField
                id="outlined-search"
                label="🔍 Search Item"
                type="search"
                fullWidth
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "25px", 
                  },
                }}
              />
            </div>

            {/* Item List */}
            <ul className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
              {menuItems[selectedCategory]
                ?.filter((item) =>
                  item.name.toLowerCase().includes(searchQuery)
                )
                .map((item) => {
                  const selectedItem = selectedItems.find((i) => i.id === item.id);
                  return (
                    <li
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b last:border-b-0"
                    >
                      <p className="font-medium">{item.name}</p>
                      {selectedItem ? (
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="px-1 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                          >
                            <MdRemove className="text-lg text-gray-700" />
                          </button>

                          <span className="mx-2">{selectedItem.quantity}</span>

                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="px-1 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                          >
                            <MdAdd className="text-lg text-gray-700" />
                          </button>
                          <ImCross
                            className="ml-3 text-red-500 cursor-pointer hover:text-red-600 text-sm"
                            onClick={() =>
                              setSelectedItems((prev) =>
                                prev.filter((cartItem) => cartItem.id !== selectedItem.id)
                              )
                            }
                          />
                        </div>
                      ) : (
                        <button
                          className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary-dark"
                          onClick={() => handleAddToCart(item)}
                        >
                          <MdAdd className="text-white text-lg" />
                        </button>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setCartOpen(false)} // Close modal when clicking the overlay
        >
          <div
            className="relative bg-white p-4 rounded-lg shadow-lg w-10/12 max-w-3xl flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Close Button */}
            <button
              className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 text-red-500 bg-white rounded-full p-2 shadow hover:bg-gray-100"
              onClick={() => setCartOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            {/* Header */}
            <h3 className="text-xl font-bold mb-4 text-secondary">Cart</h3>

            {/* Cart Items */}
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 text-center mb-3">Your cart is empty!</p>
            ) : (
              <ul className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2 mb-4">
                {selectedItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        ${item.price} x {item.quantity}
                      </p>
                    </div>

                    <button
                      className="ml-3 mr-2 px-2 py-1 bg-primary text-xs rounded-full"
                      onClick={() => handleOpenCommentsModal(item)}
                    >
                      <LuClipboardList className="text-lg text-secondary" />
                    </button>

                    <div className="flex items-center">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="px-1 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                      >
                        <MdRemove className="text-lg text-gray-700" />
                      </button>

                      <span className="mx-2">{item.quantity}</span>

                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="px-1 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                      >
                        <MdAdd className="text-lg text-gray-700" />
                      </button>
                      <ImCross
                        className="ml-3 text-red-500 cursor-pointer hover:text-red-600 text-sm"
                        onClick={() =>
                          setSelectedItems((prev) =>
                            prev.filter((cartItem) => cartItem.id !== item.id)
                          )
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {selectedItems.length > 0 && (
              <div className="bg-gray-100 p-4 rounded-lg shadow mb-4">
                <p className="text-lg font-semibold">Summary</p>

                {/** Store subtotal in a variable to avoid redundant calculations */}
                {(() => {
                  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                  const gst = subtotal * 0.09;
                  const totalBeforeDiscount = subtotal + gst;
                  const discountAmount = totalBeforeDiscount * (discount / 100);
                  const finalTotal = totalBeforeDiscount - discountAmount; // Apply discount
                  
                  return (
                <>
                    <div className="flex justify-between mt-2">
                        <p>Subtotal:</p>
                        <p className="font-medium">${subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between mt-1">
                        <p>GST (9%):</p>
                        <p className="font-medium">${gst.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between mt-1">
                        <p>Discount (%):</p>
                        <input 
                            type="number" 
                            value={discount} 
                            onChange={(e) => setDiscount(Math.max(0, Math.min(15, e.target.value)))} 
                            className="border rounded px-2 w-14 text-center"
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <p>Discount Amount:</p>
                        <p className="font-medium">-${discountAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between mt-2 border-t pt-2 font-bold">
                        <p>Total:</p>
                        <p>${finalTotal.toFixed(2)}</p>
                    </div>
                </>
            );
                })()}
              </div>
            )}

            {/* Confirm Order Button */}
            {selectedItems.length > 0 && (
              <button
                onClick={handleUpdateOrder}
                className="w-full py-2 bg-primary font-semibold text-secondary rounded-lg hover:bg-primary-dark"
              >
                Confirm Order
              </button>
            )}
          </div>
        </div>
      )}

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

      <ToastContainer />
    </div>
  );
}

export default UpdateMenu;
