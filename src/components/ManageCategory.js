import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ManageCategory.css'; 
import { useNavigate } from 'react-router-dom';

function ManageCategory() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/categories');
            setCategories(res.data);
        } catch (err) {
            console.error("Lỗi khi tải thể loại:", err);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            alert("Vui lòng nhập tên thể loại.");
            return;
        }

        try {
            await axios.post('http://localhost:3001/api/categories', {
                category_name: newCategory
            });
            setNewCategory('');
            fetchCategories();
        } catch (err) {
            console.error("Lỗi khi thêm thể loại:", err);
            alert("Không thể thêm thể loại.");
        }
    };

    const handleEdit = async (id) => {
        if (!editingName.trim()) {
            alert("Tên thể loại không được rỗng.");
            return;
        }

        try {
            await axios.put(`http://localhost:3001/api/categories/${id}`, {
                category_name: editingName
            });
            setEditingId(null);
            setEditingName('');
            fetchCategories();
        } catch (err) {
            console.error("Lỗi khi sửa:", err);
            alert("Không thể cập nhật.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;

        try {
            await axios.delete(`http://localhost:3001/api/categories/${id}`);
            fetchCategories();
        } catch (err) {
            console.error("Lỗi khi xóa:", err);
            alert("Không thể xóa.");
        }
    };

    return (
        <div className="add-category-container">
            <h2>Quản Lý Thể Loại</h2>

            <form className="add-category-form" onSubmit={handleAdd}>
                <div className="category-group">
                    <label>Thêm thể loại mới:</label>
                    <input
                        type="text"
                        name="newCategory"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        required
                    />
                </div>
                <div className="button-container">
                    <button type="submit" className="submit-button">Thêm</button>
                </div>
            </form>

            <h3>Danh sách thể loại</h3>
            {categories.map((cat) => (
                <div key={cat.category_id} className="category-group">
                    {editingId === cat.category_id ? (
                        <>
                            <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="input-edit"
                            />
                            <button className="submit-button" onClick={() => handleEdit(cat.category_id)}>Lưu</button>
                            <button className="cancel-button" onClick={() => setEditingId(null)}>Hủy</button>
                        </>
                    ) : (
                        <>
                            <span1>{cat.category_name}</span1>
                            <div className="button-container-inline">
                                <button className="submit-button" onClick={() => {
                                    setEditingId(cat.category_id);
                                    setEditingName(cat.category_name);
                                }}>Sửa</button>
                                <button className="cancel-button" onClick={() => handleDelete(cat.category_id)}>Xóa</button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ManageCategory;
