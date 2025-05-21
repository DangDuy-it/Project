import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import '../styles/CategoryMovies.css';

export default function CategoryMovies() {
  const { name } = useParams();
  const categoryName = decodeURIComponent(name);

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true); // Thêm state loading, mặc định là true khi mới vào trang
  const [error, setError] = useState(null);   // Thêm state error, mặc định là null

  console.log('Rendering CategoryMovies, current error state:', error); // LOG 1: Xem state error trước khi render
  console.log('Rendering CategoryMovies, current movies length:', movies.length); // LOG 2: Xem state movies.length trước khi render

  useEffect(() => {
    console.log('useEffect triggered for category:', categoryName); // LOG: Effect được gọi

    setLoading(true); // Bắt đầu tải dữ liệu
    setError(null);   // Xóa lỗi cũ (nếu có) trước khi fetch mới

    axios
      .get(
        `http://localhost:3001/api/categories/${encodeURIComponent(categoryName)}`
      )
      .then(res => {
        console.log('API call successful, data received:', res.data); // LOG: API thành công
        setMovies(res.data);
        // Không cần setError(null) ở đây vì đã set ở đầu effect
        // Nếu server trả về 200 với mảng rỗng, điều này vẫn đúng
      })
      .catch(err => {
        console.error("Lỗi khi lấy phim theo thể loại:", err.response); // LOG 3: Log phản hồi lỗi từ server

        // Kiểm tra nếu lỗi là 404 từ backend và có message
        if (err.response && err.response.status === 404 && err.response.data && err.response.data.message) {
             console.log('Đã vào khối xử lý 404, set error:', err.response.data.message); // LOG 4: Xác nhận vào khối 404
             setError(err.response.data.message); // Sử dụng message từ backend (ví dụ: "Không tìm thấy phim theo thể loại này.")
             setMovies([]); // Đảm bảo mảng phim rỗng khi có lỗi 404 không có dữ liệu
        } else {
             // Xử lý các lỗi khác (ví dụ: 500 Internal Server Error, lỗi mạng, ...)
             console.log('Đã vào khối xử lý lỗi khác:', err); // LOG 5: Xác nhận vào khối lỗi khác
             setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.'); // Thông báo lỗi chung
             setMovies([]); // Đảm bảo mảng phim rỗng khi có lỗi
        }
      })
      .finally(() => {
        console.log('API call finished, setting loading to false'); // LOG: API kết thúc
        setLoading(false); // Kết thúc trạng thái tải, dù thành công hay thất bại
      });

  }, [categoryName]); // Effect chạy lại khi categoryName thay đổi

  return (
    <div className="category-page">
      <h2>Thể loại: {categoryName}</h2>

      {loading && <p>Đang tải danh sách phim...</p>} {/* Hiển thị khi đang tải */}

      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Hiển thị khi có lỗi */}

      {!loading && !error && ( // Chỉ hiển thị nội dung này khi không tải và không có lỗi
        movies.length > 0 ? ( // Kiểm tra xem có phim hay không
          <ul className="movie-grid">
            {movies.map(m => (
              <li key={m.id}>
                <Link to={`/movieDetail/${m.id}`}>
                  <img src={m.image_url} alt={m.title} />
                  <p>{m.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          // Hiển thị khi không tải, không lỗi, và mảng phim rỗng
          <p>Chưa có phim nào trong thể loại này.</p>
        )
      )}
    </div>
  );
}