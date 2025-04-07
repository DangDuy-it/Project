"use client"
import '../styles/Header.css';
import { Link } from "react-router-dom";
import logo_web from '../picture/logo-1.webp';

function Header() {

  return (
    <nav>
      <div className="Logo">
        <img src={logo_web} alt="Logo" className="logo-img" />
      </div>
      <div className="Header">
        <ul>
          <li><Link to="/">TRANG CHỦ</Link></li>
          <li><Link to="/dang-anime">DẠNG ANIME</Link></li>
          <li><Link to="/the-loai">THỂ LOẠI</Link></li>
        </ul>
      </div>
      <div className="Search">
        <ul>
          <li><input placeholder="Tìm kiếm" type="text" /></li>
          <li><Link to="/login" className="Login"> Đăng Nhập</Link></li>
        </ul>

      </div>
    </nav>
  )
}
export default Header;