import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import DangAnime from "./pages/DangAnime";
import Home from "./pages/Home";
import TheLoai from "./pages/TheLoai";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MoviePlayer from "./components/MoviePlayer";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          {/* Các route công khai */}
          <Route path="/" element={<Home />} />
          <Route path="/dang-anime" element={<DangAnime />} />
          <Route path="/the-loai" element={<TheLoai />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movie/:id" element={<MoviePlayer />} /> {/* Không cần đăng nhập để xem phim */}

          {/* Các route yêu cầu đăng nhập */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;