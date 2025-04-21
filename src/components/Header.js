
import '../styles/Header.css';
import { Link } from "react-router-dom";
import axios from 'axios';
import React, { useState, useEffect } from 'react';

function Header(){
  const [categoryList, setCategoryList] = useState([]);
  
      useEffect(() => {
          axios.get('http://localhost:3001/api/categories')
              .then(res => {
                  setCategoryList(res.data);
              })
              .catch(err => console.error("Lỗi:", err));
      }, []);

  return(
  <nav>
      <div className= "Logo">
        <img src="https://cdn.animevietsub.one/data/logo/logoz.png" alt="Logo" />
      </div>
      <div className="Header">
        <ul>
          <li><Link to="/">TRANG CHỦ</Link></li>
          <li><Link to="/dang-anime">DẠNG ANIME</Link></li>
          <li className="dropdown">
            <span className="dropdown-title">THỂ LOẠI</span>
              <div className="dropdown-content">
                {categoryList.map((category) => (
                  <Link key={category.category_id} to={`/the-loai/${category.category_name.toLowerCase()}`}>
                    {category.category_name}
                  </Link>
                ))}
              </div>
          </li>
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