"use client";
import React, { useState, useEffect } from "react";
import "../styles/Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Profile() {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setUserName(parsedUser.user_name);
            setEmail(parsedUser.email);

        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để tiếp tục!");
            navigate("/login");
            return;
        }

        try {
            const res = await axios.put(
                "http://localhost:3001/api/user",
                { user_name: userName, email, password: password || undefined },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setUser(res.data.user);
            // Gửi sự kiện để thông báo rằng user đã thay đổi
            window.dispatchEvent(new Event("userChanged"));
            toast.success("Cập nhật thông tin thành công!", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            setError(err.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div>Đang tải...</div>;

    return (
        <div className="container">
            <ToastContainer />
            <h2>Quản Lý Tài Khoản</h2>
            <form className="form" onSubmit={handleSubmit}>
                <label>Tên người dùng</label>
                <input
                    type="text"
                    placeholder="Nhập tên người dùng"
                    value={userName}
                    required
                    disabled
                />
                <label>Email</label>
                <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    required
                    disabled
                />
                <label>Mật khẩu mới (để trống nếu không muốn thay đổi)</label>
                <input
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Cập Nhật"}
                </button>
            </form>
        </div>
    );
}

export default Profile;