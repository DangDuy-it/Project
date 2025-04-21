import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import DangAnime from "./pages/DangAnime"; // Import giao diện Dạng Anime
import Home from "./pages/Home"; // Import giao diện Trang chủ
import TheLoai from "./pages/TheLoai";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MoviePlayer from "./components/MoviePlayer";
import DuyetPhim from "./pages/Admin/DuyetPhim";
import SuaPhim from "./pages/Admin/SuaPhim";

function App() {
  return (
    <div className="App">
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} /> {/* Trang chủ */}
        <Route path="/dang-anime" element={<DangAnime />} /> {/* Dạng Anime */}
        <Route path="/the-loai/:category_name" element={<TheLoai />} /> {/* Dạng Anime */}
        <Route path="/login" element={<Login/>}></Route> {/* Trang Đăng Nhập */}
        <Route path="register" element={<Register/>}></Route> {/* Trang Đăng Ký */}
        <Route path="/movie/:id" element={<MoviePlayer />} /> {/* Trang phát video */}
        <Route path="/admin/duyet-phim" element={<DuyetPhim/>}/>
        <Route path="/admin/sua-phim/:id" element={<SuaPhim/>}/>
      </Routes>
    </Router>
    </div>
  );
}

export default App;

