import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import '../styles/HeaderAdmin.css';

function HeaderAdmin() {
    const navigate = useNavigate(); // Sử dụng useNavigate để điều hướng

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("userChanged")); // Gửi sự kiện để cập nhật Header
        navigate("/login"); // Chuyển hướng đến trang đăng nhập
    };

    return (
        <nav>
            <div className="logo">
                <img src="/images/logo-1.webp" alt="Logo" />
            </div>
            <div className="header">
                <ul>
                    <li><Link to="/manageuser">QUẢN LÝ TÀI KHOẢN</Link></li>
                    <li><Link to="/managemovie">QUẢN LÝ PHIM</Link></li>  
                </ul>
            </div>
            <div className="search">
                <ul>
                    <li><input placeholder="Tìm kiếm" type="text" /></li>
                </ul>
            </div>
            <div className="user-infor">
                <ul>
                    <li>Admin</li>
                    <button onClick={handleLogout} className="button-logout" >
                            Đăng Xuất
                        </button>
                </ul>
            </div>

                    
        </nav>
    );
}

export default HeaderAdmin;