"use client";
import React, { useEffect, useState } from "react";
import "../styles/Header.css";
import { Link, useNavigate } from "react-router-dom";
import logo_web from "../picture/logo-1.webp";
import axios from "axios";

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");

  // Hàm để lấy thông tin user từ localStorage
  const updateUserFromStorage = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } else {
      setUser(null);
    }
  };

  // Cập nhật user khi component mount
  useEffect(() => {
    updateUserFromStorage();
  }, []);

  // Lắng nghe sự kiện tùy chỉnh để cập nhật user
  useEffect(() => {
    const handleUserChange = () => {
      updateUserFromStorage();
    };

    window.addEventListener("userChanged", handleUserChange);
    return () => {
      window.removeEventListener("userChanged", handleUserChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("userChanged"));
    navigate("/login");
  };

  // Lấy danh sách thể loại 
  const [categoryList, setCategoryList] = useState([]);
  
  useEffect(() => {
      axios.get('http://localhost:3001/api/categories')
          .then(res => {
              setCategoryList(res.data);
          })
          .catch(err => console.error("Lỗi:", err));
  }, []);

  return (
    <nav>
      <div className="Logo">
        <Link to="/">
          <img src={logo_web} alt="Logo" className="logo-img" />
        </Link>
      </div>
      <div className="Header">
        <ul>
          <li>
            <Link to="/">TRANG CHỦ</Link>
          </li>
          {/* <li className="dropdown">
            <Link to="/dang-anime" className="dropdown-toggle">
              DẠNG ANIME
            </Link>
            <ul className="dropdown-menu">
              <li>
                <Link to="/dang-anime/phim-1">Phim 1</Link>
              </li>
              <li>
                <Link to="/dang-anime/phim-2">Phim 2</Link>
              </li>
              <li>
                <Link to="/dang-anime/phim-3">Phim 3</Link>
              </li>
            </ul>
          </li> */}
          <li className="dropdown">
            <span className="dropdown-title"> THỂ LOẠI</span>
            <div className="dropdown-content">
              {categoryList.map((category) => (
                <Link key={category.category_id} to={`/the-loai/${encodeURIComponent(category.category_name)}`}>
                  {category.category_name}
                </Link>
              ))}
            </div>
          </li>
        </ul>
      </div>
      <div className="Search">
        <ul>
        <li>
            <input
              placeholder="Tìm kiếm"
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/movies/search?keyword=${encodeURIComponent(searchKeyword)}`);
                }
              }}
            />
          </li>
          <li>
            {user ? (
              <div className="user-info">
                <Link to="/profile" className="user-name">
                  Xin chào, {user.user_name || user.email || "Người dùng"}
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  Đăng Xuất
                </button>
              </div>
            ) : (
              <Link to="/login" className="Login">
                Đăng Nhập
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Header;