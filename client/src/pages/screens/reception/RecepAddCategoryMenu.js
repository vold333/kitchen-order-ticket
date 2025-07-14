import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { Dialog } from "@headlessui/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../services/api";
import Paper from '@mui/material/Paper';
import Swal from 'sweetalert2';
import { MdClose } from "react-icons/md";

const RecepAddCategoryMenu = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState("");
  const [fileError, setFileError] = useState("");
  const [newItem, setNewItem] = useState({
    id: null,
    categoryId: "",
    name: "",
    price: "",
    url: "",
    status: "available",
  });

  // Fetch all categories and items on component mount
  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await api.get("/category/all");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch all menu items
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

  // Handle adding a new category
  const handleAddCategory = async () => {
    try {
      const response = await api.post("/category/create", newCategory);
      setCategories([...categories, response.data]);
      setMenuItems({ ...menuItems, [response.data.id]: [] });
      fetchCategories();
      setNewCategory({ name: "", description: "" });
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (id) => {
    if (!selectedCategoryToDelete) {
      toast.info("Please select a category to delete.");
      return;
    }

    try {
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
          await api.delete(`/category/delete/${selectedCategoryToDelete}`);
          setCategories(categories.filter((category) => category.id !== selectedCategoryToDelete));
          delete menuItems[selectedCategoryToDelete];
          setMenuItems({ ...menuItems });
          fetchCategories();
          setIsCategoryModalOpen(false);
          setSelectedCategoryToDelete(""); // Reset selection
        } catch (error) {
          console.error("Error deleting category:", error);
        }
      });     
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Handle adding a new item
  const handleAddItem = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("description", "");
      formData.append("price", newItem.price);
      formData.append("category_id", newItem.categoryId);
      // formData.append("image", newItem.url);

      // Ensure that we only append the file if it exists
      if (newItem.url instanceof File) {
        formData.append("image", newItem.url);
      }

      formData.append("status", newItem.status);

      const response = await api.post("/items/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMenuItems({
        ...menuItems,
        [newItem.categoryId]: [...(menuItems[newItem.categoryId] || []), response.data],
      });
      fetchMenuItems();
      setNewItem({
        id: null,
        categoryId: "",
        name: "",
        price: "",
        url: "",
        status: "available",
      });
      setIsItemModalOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Handle updating an item
  const handleUpdateItem = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("description", "");
      formData.append("price", newItem.price);
      formData.append("category_id", newItem.categoryId);
      // formData.append("image", newItem.url);

      // Ensure that we only append the file if it exists
      if (newItem.url instanceof File) {
        formData.append("image", newItem.url);
      }

      formData.append("status", newItem.status);

      await api.put(`/items/update/${newItem.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedItems = menuItems[newItem.categoryId].map((item) =>
        item.id === newItem.id ? { ...item, ...newItem } : item
      );
      setMenuItems({
        ...menuItems,
        [newItem.categoryId]: updatedItems,
      });
      fetchCategories();
      fetchMenuItems();
      setNewItem({
        id: null,
        categoryId: "",
        name: "",
        price: "",
        url: "",
        status: "available",
      });
      setIsItemModalOpen(false);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id, categoryId) => {
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
          await api.delete(`/items/delete/${id}`);
          const updatedItems = menuItems[categoryId].filter((item) => item.id !== id);
          setMenuItems({
            ...menuItems,
            [categoryId]: updatedItems,
          });
        } catch (error) {
          console.error("Error deleting item:", error);
        }
    });
  };

  // Clear fields when opening the Add Item modal
  const openAddItemModal = () => {
    setNewItem({
      id: null,
      categoryId: "",
      name: "",
      price: "",
      url: "",
      status: "available",
    });
    setIsItemModalOpen(true);
  };

  // Filter items based on search term and selected category
  const allItems = Object.values(menuItems).flat();
  const filteredItems = allItems.filter(
    (item) =>
      item &&
      (selectedCategory === "all" || menuItems[selectedCategory]?.some((i) => i.id === item.id)) &&
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full p-4 font-sans">
      {/* Search Bar with Buttons */}
      <div className="mb-4 flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
        {/* Search Bar */}
        <div className="flex items-center w-full sm:w-2/3 md:w-1/2 lg:w-2/3 xl:w-2/3">
          <FaSearch className="text-gray-500 text-xl mr-2" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950"
          />
        </div>
        <div className="flex justify-between gap-2 sm:justify-start">
          <button
            onClick={() => {
              setModalMode("add");
              setIsCategoryModalOpen(true);
            }}
            className="w-full sm:w-auto bg-blue-50 px-3 py-2 rounded-2xl shadow hover:bg-blue-200 font-semibold text-blue-950 transition"
          >
            + Add Category
          </button>

          <button
            onClick={openAddItemModal}
            className="w-full sm:w-auto bg-blue-50 px-3 py-2 rounded-2xl shadow hover:bg-blue-200 font-semibold text-blue-950 transition"
          >
            + Add Item
          </button>

          <button
            onClick={() => {
              setModalMode("delete");
              setIsCategoryModalOpen(true);
            }}
            className="w-full sm:w-auto bg-red-50 px-3 py-2 rounded-2xl shadow hover:bg-red-200 font-semibold text-red-950 transition"
          >
            - Delete Category
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto space-x-4 mb-4 pb-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-gray-200">
      <Paper elevation={3} sx={{borderRadius: "15px"}}
          className={`flex flex-col ml-2 items-center px-1 min-w-[7rem] md:min-w-[6.5rem] lg:min-w-[6rem] xl:min-w-[8rem] 
            max-w-[8rem] h-20 md:h-20 lg:h-18 xl:h-28 justify-center border rounded-xl shadow-md transition-all ${
            selectedCategory === "all" ? "bg-blue-50" : "bg-white text-black"
          }`}
          onClick={() => setSelectedCategory("all")}
        >          
          <span className="font-medium text-center break-words whitespace-normal">All</span>
          <span className="text-sm text-gray-600">({allItems.length})</span>
        </Paper>
        {categories.map((category) => (
          <Paper elevation={3} sx={{borderRadius: "15px"}}
            key={category.id}
            className={`flex flex-col items-center px-1 min-w-[7rem] md:min-w-[6.5rem] lg:min-w-[6rem] xl:min-w-[8rem]
               max-w-[8rem] h-20 md:h-20 lg:h-18 xl:h-28 justify-center border rounded-xl shadow-md transition-all ${
              selectedCategory === category.id ? "bg-blue-50" : "bg-white text-blue-950"
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
      
      {/* Modal for Adding/Deleting Category */}
      <Dialog open={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} className="relative z-10">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative w-full max-w-md bg-white rounded-2xl p-6 space-y-4">
            <Dialog.Title className="text-lg font-bold">
              {modalMode === "add" ? "Add New Category" : "Delete Category"}
            </Dialog.Title>

            <button
              className="absolute top-0 right-0 transform translate-x-2 -translate-y-6 text-red-500 bg-white rounded-full p-2 shadow hover:bg-gray-100"
              onClick={() =>  setIsCategoryModalOpen(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            {/* Add Category Form */}
            {modalMode === "add" && (
              <>
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950"
                />
                <button
                  onClick={handleAddCategory}
                  className="w-full bg-tertiary text-secondary px-4 py-2 rounded-2xl font-semibold hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newCategory.name}
                >
                  Add
                </button>
              </>
            )}

            {/* Delete Category Form */}
            {modalMode === "delete" && (
              <>
                <select
                  value={selectedCategoryToDelete}
                  onChange={(e) => setSelectedCategoryToDelete(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleDeleteCategory}
                  className="w-full bg-red-100 text-red-950 px-4 py-2 rounded-2xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedCategoryToDelete}
                >
                  Delete
                </button>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
      
      {/* Modal for Adding Item */}
      <Dialog open={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} className="relative z-10">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4 relative">
            <Dialog.Title className="text-lg font-bold">{newItem.id ? "Edit Item" : "Add New Item"}</Dialog.Title>            

             <button
                className="absolute top-0 right-0 transform translate-x-2 -translate-y-6 text-red-500 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                onClick={() =>  setIsItemModalOpen(false)}
              >
                <MdClose className="text-2xl" />
              </button>           

            {/* Category Dropdown */}
            <select
              value={newItem.categoryId}
              onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Item Name */}
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.name}
              maxLength={80}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl"
            />

            {/* Item Price */}
            <input
              type="number"
              placeholder="Item Price"
              value={newItem.price}
              // onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              onChange={(e) => {
                const value = e.target.value.slice(0, 10); // Limit to 10 digits
                setNewItem({ ...newItem, price: value });
              }}
              className="w-full px-4 py-2 border rounded-xl"
            />

            {/* File Input */}            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setNewItem((prev) => ({ ...prev, url: file })); // Store the actual File object
                  setFileError(""); 
                } else {
                  setFileError("File is required.");
                }
              }}
              className="w-full px-4 py-2 border rounded-xl"
            />

            {fileError && <p className="text-red-500 text-sm">{fileError}</p>}

            {/* Save Button (Disabled if required fields are empty) */}
            <button
              onClick={newItem.id ? handleUpdateItem : handleAddItem}
              className="w-full bg-tertiary text-secondary px-4 py-2 font-semibold rounded-2xl hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newItem.categoryId || !newItem.name || !newItem.price}
            >
              Save
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Menu Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-1 sm:max-h-[40vh] md:max-h-[65vh] lg:max-h-[60vh] xl:max-h-[65vh] overflow-y-auto">
        {filteredItems.map((item) => (
          <Paper elevation={4} sx={{borderRadius: "20px"}}
              key={item.id} 
              className="relative border ml-1 p-2 sm:p-3 md:p-2 lg:p-3 bg-white rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl shadow-md 
                  hover:shadow-lg md:hover:shadow-xl lg:hover:shadow-2xl group transition-all duration-300 transform"
            >
            {item.image ? (
              <img
                src={`${api.defaults.baseURL}/${item.image.replace(/\\/g, "/")}`}
                alt={item.name}
                className="w-full h-32 sm:h-36 md:h-28 lg:h-36 xl:h-48 
                      rounded-xl sm:rounded-xl md:rounded-xl object-cover mb-1 sm:mb-2"
              />
            ) : (
              <div className="w-full h-32 sm:h-36 md:h-28 lg:h-36 xl:h-48 object-cover mb-1 sm:mb-2 rounded-xl bg-gray-300 flex items-center justify-center text-gray-600">
                No Image
              </div>
            )}

            <div className="absolute top-0 right-0 bg-white rounded-bl-full p-2 shadow-lg">
              <p className="ml-2 text-lg font-semibold text-gray-800">${item.price}</p>
            </div> 
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-medium text-blue-950">{item.name}</h3>
              </div>
              
              <div className="absolute top-4 left-4">
              <button
                onClick={() => {
                  setNewItem({
                    id: item.id,
                    categoryId: item.category_id,
                    name: item.name,
                    price: item.price,
                    url: item.image,
                    status: item.status,
                  });
                  setIsItemModalOpen(true);
                }}
                className="bg-white p-2 rounded-full shadow-lg"
              >
                <FaEdit className="text-blue-500" />
              </button>
              <button
                onClick={() => handleDeleteItem(item.id, item.category_id)}
                className="bg-white p-2 rounded-full shadow-lg ml-2"
              >
                <FaTrash className="text-red-500" />
              </button>
            </div>
          </Paper>
        ))}
      </div>
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

export default RecepAddCategoryMenu;