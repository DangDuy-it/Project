import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState } from 'react'; 
import '../styles/HeaderTechnical.css';
import logo_web from "../picture/logo-1.webp";

function HeaderTechnical() {
    const navigate = useNavigate(); // Sử dụng useNavigate để điều hướng
    const location= useLocation();
    const [searchTerm, setSearchTerm]= useState('');
    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("userChanged")); // Gửi sự kiện để cập nhật Header
        navigate("/login"); // Chuyển hướng đến trang đăng nhập
    };
        // Hàm xử lý thay đổi trong ô tìm kiếm
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Hàm xử lý gửi yêu cầu tìm kiếm (ví dụ: khi nhấn Enter)
    const handleSearchSubmit = (event) => {
        if (event.key === 'Enter' && searchTerm.trim() !== '') {
            navigate(`/technical/search?query=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
        }
    };

    return (
        <nav>
            <div className="logo">
                <Link to="/technical">
                    <img src={logo_web} alt="Logo" className="logo-img" />
                </Link>
            </div>
            <div className="header">
                <ul>
                    <li><Link to="/technical/responsed">ĐÃ PHẢN HỒI</Link></li>
                    <li><Link to="/technical/unresponse">CHƯA PHẢN HỒI</Link></li>  
                </ul>
            </div>
            <div className="search">
                <ul>
                    <li>
                        <input 
                        placeholder="Tìm kiếm tiêu đề lỗi"
                        type="text" 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchSubmit}
                        />
                    </li>
                </ul>
            </div>
            <div className="user-infor">
                <ul>
                    <li>Technical</li>
                    <button onClick={handleLogout} className="button-logout" >
                            Đăng Xuất
                        </button>
                </ul>
            </div>         
        </nav>
    );
}

export default HeaderTechnical;