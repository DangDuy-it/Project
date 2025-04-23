import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import '../styles/Header.css';

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
                <img src="https://cdn.animevietsub.one/data/logo/logoz.png" alt="Logo" />
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
                    <li>
                        <button onClick={handleLogout} style={{ cursor: 'pointer', background: 'red', color: 'white', border: 'none', padding: '5px 10px' }}>
                            Đăng Xuất
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default HeaderAdmin;