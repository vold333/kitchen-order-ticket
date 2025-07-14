import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Autocomplete, TextField } from "@mui/material";
import { IoMdAdd } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { debounce } from "lodash";
import { Paper } from "@mui/material";
import Swal from 'sweetalert2';

const CookComments = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [updatedCommentText, setUpdatedCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = debounce(() => {
      api.get("/category/all").then((response) => setCategories(response.data));
    }, 300);
    fetchCategories();
  }, []);

  // Fetch comments when category changes
  useEffect(() => {
    fetchComments();
  }, [selectedCategory]);

  const fetchComments = async () => {
    if (selectedCategory) {
      setLoading(true);
      try {
        const response = await api.get(`/cook-comments/all?category_id=${selectedCategory.id}`);
        setComments(response.data.data.reverse());
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Add a new comment
  const handleAddComment = () => {
    if (!newComment.trim()) return toast.info("Enter a comment!");
    api
      .post("/cook-comments/add", { category_id: selectedCategory.id, comments: newComment })
      .then(() => {
        setNewComment("");
        fetchComments();
      });
  };

  // Delete a comment
  const handleDeleteComment = (id) => {
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
          await api.delete(`/cook-comments/${id}`).then(() => fetchComments());
        } catch (error) {
          console.error("Error deleting item:", error);
        }
    });
    
  };

  // Start editing a comment
  const handleEditComment = (id, text) => {
    setEditingCommentId(id);
    setUpdatedCommentText(text);
  };

  // Save the updated comment
  const handleSaveComment = (id) => {
    if (!updatedCommentText.trim()) return toast.error("Comment cannot be empty!");
    api
      .put(`/cook-comments/${id}`, { comments: updatedCommentText })
      .then(() => {
        setEditingCommentId(null);
        setUpdatedCommentText("");
        fetchComments();
      });
  };

  return (
    <div className="p-3 bg-gray-200 h-full flex flex-col items-center overflow-x-hidden">
      {/* Header */}
      <h1 className="text-2xl font-bold text-secondary mb-4 text-center">
      Cooking Instructions
      </h1>

      {/* Select Category and Add New Comment Side by Side */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center gap-6 mb-8">
        {/* Select Category */}
        <div className="w-full">
          <Autocomplete
            options={categories}
            getOptionLabel={(option) => option.name || ""}
            value={selectedCategory}
            onChange={(event, newValue) => setSelectedCategory(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Category" variant="outlined" fullWidth />
            )}
          />
        </div>

        {/* Add New Comment */}
        <div className="w-full flex items-center gap-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type your comment"
            className="flex-grow p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-secondary"
          />
          <button
            onClick={handleAddComment}
            aria-label="Add comment"
            className="p-2 bg-secondary text-white rounded-full transition flex justify-center"
          >
            <IoMdAdd className="text-lg" />
          </button>
        </div>
      </div>

      {/* Existing Comments */}
      <Paper elevation={4} sx={{borderRadius: "20px"}} className="w-full max-w-2xl sm:max-h-[40vh] md:max-h-[68vh] lg:max-h-[70vh] xl:max-h-[74vh] bg-white p-6 rounded-lg shadow-md overflow-y-auto">
        <h2 className="text-xl font-semibold text-secondary mb-4">Existing Comments</h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : comments.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="flex justify-between items-center bg-tertiary p-4 rounded-xl hover:bg-gray-200 transition"
              >
                {editingCommentId === comment.id ? (
                  <div className="flex gap-2 w-auto">
                    <input
                      type="text"
                      value={updatedCommentText}
                      onChange={(e) => setUpdatedCommentText(e.target.value)}
                      className="flex-grow p-1 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-950"
                    />
                    <button
                      onClick={() => handleSaveComment(comment.id)}
                      className="px-2 py-2 bg-blue-950 text-white rounded-full transition flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <FaCheck className="text-lg" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{comment.comments}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditComment(comment.id, comment.comments)}
                        aria-label="Edit comment"
                        className="px-2 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
                      >
                        <MdEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        aria-label="Delete comment"
                        className="px-2 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      >
                        <MdDelete className="text-lg" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No comments available</p>
        )}
      </Paper>
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

export default CookComments;