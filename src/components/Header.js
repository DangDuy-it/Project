"use client";
import React, { useEffect, useState, useRef } from "react";
import "../styles/Header.css";
import { Link, useNavigate } from "react-router-dom";
import logo_web from "../picture/logo-1.webp";
import axios from "axios";


function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showDropdown, setShowDropdown]= useState(false);

  const dropdownRef = useRef(null);
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
  const handleSearchChange=(event)=>{
    setSearchKeyword(event.target.value);
  }
  const handleSearchSubmit=(event)=>{
    if (event.key== 'Enter'){
      if(searchKeyword.trim() != ''){
        navigate(`/movies/search?keyword=${encodeURIComponent(searchKeyword)}`);  
        setSearchKeyword('');         
      }
    }
  }
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
    // Effect để xử lý click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Nếu dropdown đang mở VÀ click không phải là bên trong phần tử dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    // Thêm event listener khi dropdown mở
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Gỡ bỏ event listener khi component unmount hoặc khi dropdown đóng
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]); // Chạy lại effect khi showDropdown thay đổi

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
          <div className="category-drown">
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
          </div>
        </ul>
      </div>
      <div className="Search">
        <ul>
        <li>
            <input
              placeholder="Tìm kiếm"
              type="text"
              value={searchKeyword}
              onChange={handleSearchChange}
              onKeyDown={handleSearchSubmit}
            />
          </li>
          <li>
            {user ? (
              <div className="user-info" ref={dropdownRef}>
                <div className="user-dropdown">
                  <div className="user-name" onClick={() => setShowDropdown(!showDropdown)}>
                    Xin chào, {user.user_name}
                  </div>
                  {showDropdown && (
                    <ul className="dropdown-menu">
                      <li onClick={() => {
                        navigate("/profile");
                        setShowDropdown(false); 
                      }}>Quản lý thông tin</li>
                      <li onClick={() => {       
                        navigate("/movies/favorites");
                        setShowDropdown(false)} }>Danh sách yêu thích</li>
                      <li onClick={() => {
                        navigate("/movies/watch-history");
                        setShowDropdown(false);
                        }}>Lịch sử xem phim</li>
                    </ul>
                  )}
                </div>
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