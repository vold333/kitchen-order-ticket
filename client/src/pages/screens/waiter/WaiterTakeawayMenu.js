import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdAdd, MdLogout, MdShoppingCart, MdClose, MdRemove } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { IoArrowBack } from "react-icons/io5";
import useLogout from "../../../services/logout";
import qrImage from "../../../assets/images/qr.png";
import api from "../../../services/api";
import { TextField } from "@mui/material";
import { LuClipboardList } from "react-icons/lu";

function WaiterTakeawayMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  
  const queryParams = new URLSearchParams(location.search);
  const tableId = queryParams.get("tableId");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false); 
  const [paymentType, setPaymentType] = useState(""); 
  const [transactionId, setTransactionId] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [cookingComments, setCookingComments] = useState({});
  const [selectedItemForComments, setSelectedItemForComments] = useState(null);
  const [selectedComments, setSelectedComments] = useState({});

  const user = JSON.parse(localStorage.getItem('user'));
  const waiterId = user?.id; 

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

      await api.post("/print/kitchen", receiptData);
      console.log("Kitchen receipt printed successfully.");
    } catch (error) {
      console.error("Error fetching table number or printing kitchen receipt:", error);
    }
  };

  const handlePrintPaymentBill = async (orderId, tableId, orderType, items, subtotal, gst, discount, finalTotal, paymentType) => {
      try {

           // Fetch table details to get the table_number
          const tableResponse = await api.get(`/tables/${tableId}`);
          const table_number = tableResponse.data.table_number;

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

    const handleCheckout = async () => {
        if (selectedItems.length === 0) {
            toast.error("Your cart is empty!", { autoClose: 1500 });
            return;
        }

        // Open Payment Modal Instead of Directly Submitting
        setPaymentModalOpen(true);
    };

    const handleSubmitOrder = async () => {
        if (loading) return; // Prevent double submission
        setLoading(true); // Start loading
    
        try {
            if (!paymentType) {
                toast.error("Please select a payment method!", { autoClose: 1500 });
                setLoading(false);
                return;
            }
    
            if (paymentType === "qr" && (!transactionId || !proofFile)) {
                toast.error("Please provide transaction ID and proof file.", { autoClose: 1500 });
                setLoading(false);
                return;
            }
    
            const formData = new FormData();
            formData.append("table_id", tableId);
            formData.append("waiter_id", waiterId);
            formData.append("order_type", "takeaway");
            formData.append("total_amount", 0);
            formData.append("payment_type", paymentType);
            formData.append("status", "served");
    
            if (paymentType === "qr") {
                formData.append("transaction_id", transactionId);
                formData.append("proof", proofFile);
            }
    
            const orderResponse = await api.post("/orders/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            const { id: order_id } = orderResponse.data;
    
            // Step 2: Add items to order 
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
                order_id,
                item_id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price * item.quantity,
                special_request: commentTexts.length > 0 ? commentTexts.join(", ") : "",
              };
            });   
    
            await api.post("/orderItems/create", updatedItems);
    
            // Step 3: Calculate final total with discount
            const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
            const gst = subtotal * 0.09;
            const totalBeforeDiscount = subtotal + gst;
            const discountAmount = totalBeforeDiscount * (discount / 100);
            const finalTotal = totalBeforeDiscount - discountAmount;
    
            // Step 4: Update total amount
            await api.put(`/orders/update/${order_id}`, {
                total_amount: finalTotal.toFixed(2),
                discount: discount,
            });
    
            // Step 5: Print the kitchen receipt
            await handlePrintKitchenReceipt(order_id, "TAKEAWAY", tableId, updatedItems);

            // Modify handleSubmitOrder to call payment bill function after updating order total
            await handlePrintPaymentBill(order_id, tableId, "TAKEAWAY", updatedItems, subtotal, gst, discountAmount, finalTotal, paymentType);
    
            toast.success("Order Placed Successfully!", { autoClose: 1500 });
    
            // Reset States
            setSelectedItems([]);
            setCartOpen(false);
            setPaymentModalOpen(false);
    
            // Navigate back to waiter dashboard
            setTimeout(() => {
                navigate("/waiter");
            }, 1500);
    
        } catch (error) {
            console.error("Error placing order:", error);
            toast.error("Failed to place the order. Please try again.", { autoClose: 1500 });
        } finally {
            setLoading(false);
        }
    };    

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Header */}
      <header className="w-full bg-tertiary py-3 px-3 flex justify-between items-center">
        <button
          onClick={() => navigate('/waiter')}
          className="flex items-center justify-center w-10 h-10 bg-white text-secondary rounded-full hover:text-blue-600 transition duration-300"
        >
          <IoArrowBack className="text-2xl" />
        </button>
        <h1 className="text-xl sm:text-xl md:text-2xl xl:text-3xl font-bold text-secondary">Takeaway Menu</h1>
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
                            await handleSubmitOrder();
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
           
            <h3 className="text-xl font-bold mb-4 text-secondary">Cart</h3>
         
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
                  const finalTotal = totalBeforeDiscount - discountAmount;               
          
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
                            className="border rounded px-2 w-11 text-center"
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

            {selectedItems.length > 0 && (
              <button
                onClick={handleCheckout}
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

export default WaiterTakeawayMenu;
