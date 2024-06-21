import React, { useState } from 'react';
import axios from 'axios';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import './AddCategory.css';

function AddCategory() {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', image);
    formData.append('status', 'Active'); // You can update this as per your requirement

    try {
      await axios.post('http://localhost:5000/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Redirect to the category list page or show a success message
      window.location.href = '/category';
    } catch (error) {
      console.error("Error adding category", error);
    }
  };

  return (
    <div className="home-content">
      <Topbar />
      <div className="main-container">
        <Sidebar />
        <div className="content-container">
          <h2>Add New Category</h2>
          <form onSubmit={handleSubmit} className="add-category-form">
            <div className="form-group">
              <label>Category Name:</label>
              <input
                type="text" style={{width:'30%'}}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Upload Image:</label>
              <input
                type="file" style={{width:'30%'}}
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
            </div>
            <button type="submit" className="submit-btn">Add Category</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCategory;
