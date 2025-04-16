import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/SuaTTPhim.css";

const SuaTTPhim = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:3001/api/movies/${id}`)
            .then((res) => setMovie(res.data))
            .catch((err) => console.error("Lỗi khi lấy thông tin phim:", err));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMovie({ ...movie, [name]: value });
    };

    if (!movie) return <div>Đang tải thông tin phim...</div>;

    return (
        <div className="movie-edit-container">
            <h2>THÔNG TIN PHIM</h2>
            <div className="movie-edit-box">
                <img
                    src={movie.image_url || "https://m.media-amazon.com/images/I/81pTbZF5KXL._AC_SL1500_.jpg"}
                    alt="poster"
                    className="movie-poster"
                />
                <div className="movie-info">
                    <label>
                        <span>Tên phim:</span>
                        <input type="text" name="title" value={movie.title} onChange={handleChange} />
                    </label>

                    <label>
                        <span>Thể loại:</span>
                        <input type="text" name="genre" value={movie.genre} onChange={handleChange} />
                    </label>

                    <label>
                        <span>Năm phát hành:</span>
                        <input type="text" name="year" value={movie.year} onChange={handleChange} />
                    </label>

                    <label>
                        <span>Thời lượng/ Số tập:</span>
                        <input type="text" name="duration" value={movie.duration} onChange={handleChange} />
                    </label>

                    <label>
                        <span>Trạng thái:</span>
                        <input type="text" name="status" value={movie.status} onChange={handleChange} />
                    </label>

                    <label>
                        <span>Mô tả:</span>
                        <textarea name="description" value={movie.description} onChange={handleChange} rows="4" />
                    </label>

                    <div className="movie-actions">
                        <button className="btn save">Lưu Phim</button>
                        <button className="btn cancel">Hủy Bỏ</button>
                        <button className="btn upload">Upload Video</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuaTTPhim;
