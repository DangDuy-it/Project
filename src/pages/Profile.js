"use client";
import React, { useState, useEffect } from "react";
import "../styles/Login.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Profile() {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    const fetchFavorites = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const res = await axios.get("http://localhost:3001/api/users/favorites", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavorites(res.data || []);
        } catch (err) {
            console.error("Lỗi lấy danh sách yêu thích:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                navigate("/login");
            } else {
                toast.error("Không thể tải danh sách yêu thích!");
            }
            setFavorites([]);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setUserName(parsedUser.user_name);
            setEmail(parsedUser.email);

            // Lấy lịch sử xem phim từ localStorage
            setHistory(JSON.parse(localStorage.getItem("watchHistory") || "[]"));

            fetchFavorites();
        } else {
            navigate("/login");
        }

        // Lắng nghe sự kiện favorite thay đổi từ các component khác
        const handleFavoriteChange = () => {
            fetchFavorites();
        };

        window.addEventListener("favoriteChanged", handleFavoriteChange);

        return () => {
            window.removeEventListener("favoriteChanged", handleFavoriteChange);
        };
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
            toast.error(err.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (movieId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để tiếp tục!");
            navigate("/login");
            return;
        }

        try {
            await axios.delete(`http://localhost:3001/api/users/favorites/${movieId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavorites(favorites.filter((movie) => movie.movie_id !== movieId));
            toast.success("Đã xóa phim khỏi danh sách yêu thích!");
            window.dispatchEvent(new Event("favoriteChanged"));
        } catch (err) {
            toast.error(
                "Lỗi: " + (err.response?.data?.error || "Thử lại sau")
            );
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate("/login");
            }
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
                    onChange={(e) => setUserName(e.target.value)}
                    required
                />
                <label>Email</label>
                <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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

            <div className="favorites-section">
                <h3>Danh Sách Phim Yêu Thích</h3>
                {favorites.length > 0 ? (
                    <ul>
                        {favorites.map((movie) => (
                            <li key={movie.movie_id}>
                                <Link to={`/movie/${movie.movie_id}`}>
                                    {movie.title} ({movie.release_year}) - {movie.genre}
                                </Link>
                                <button
                                    onClick={() => removeFavorite(movie.movie_id)}
                                    className="remove-favorite-btn"
                                    style={{ marginLeft: "10px", color: "red" }}
                                >
                                    Xóa
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Chưa có phim nào trong danh sách yêu thích.</p>
                )}
            </div>

            <div className="history-section">
                <h3>Lịch Sử Xem Phim</h3>
                {history.length > 0 ? (
                    <ul>
                        {history.map((item) => (
                            <li key={item.id}>
                                <Link to={`/movie/${item.id}`}>
                                    {item.title} (Xem lúc: {new Date(item.timestamp).toLocaleString()})
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Chưa có lịch sử xem phim.</p>
                )}
            </div>
        </div>
    );
}

export default Profile;