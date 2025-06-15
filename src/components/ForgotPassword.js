"use client";
import React, { useState } from "react";
import "../styles/Login.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put('http://localhost:3001/forgot-password', {
                user_name: userName,
                email,
                new_password: newPassword
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            toast.success(response.data.message, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            setUserName("");
            setEmail("");
            setNewPassword("");

            window.dispatchEvent(new Event("userChanged"));
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại";
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <ToastContainer />
            <h2>Quên Mật Khẩu</h2>
            <form className="form" onSubmit={handleForgotPasswordSubmit}>
                <label>Tên Người Dùng</label>
                <input
                    type="text"
                    placeholder="Nhập tên người dùng"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    disabled={loading}
                />
                <label>Email</label>
                <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                <label>Mật Khẩu Mới</label>
                <input
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                />
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Cập Nhật Mật Khẩu"}
                </button>
                <button 
                    type="button" 
                    className="btn" 
                    onClick={() => { 
                        setUserName(""); 
                        setEmail(""); 
                        setNewPassword(""); 
                    }} 
                    disabled={loading}
                >
                    Hủy
                </button>
            </form>
        </div>
    );
}

export default ForgotPassword;