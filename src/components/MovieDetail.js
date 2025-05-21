import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/MovieDetail.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState("info");
    const [reviews, setReviews] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [rating, setRating] = useState(10);
    const navigate = useNavigate();

    const handleTokenError = (err) => {
        if (err.response && err.response.status === 403 && err.response.data?.error === 'Token không hợp lệ hoặc đã hết hạn') {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            localStorage.removeItem("token");
            navigate("/login");
            return true;
        }
        return false;
    };

    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                const movieRes = await fetch(`http://localhost:3001/api/movies/${id}`);
                const movieData = await movieRes.json();

                if (movieData) {
                    setMovie(movieData);
                } else {
                    setMovie(null);
                }
                                // 2. Fetch Đánh giá phim
                // Gọi API backend để lấy danh sách đánh giá
                const reviewsRes = await axios.get(`http://localhost:3001/api/reviews/${id}`);
                setReviews(reviewsRes.data); // Cập nhật state reviews

                const token = localStorage.getItem("token");
                if (token) {
                    try {
                        const statusRes = await axios.get(`http://localhost:3001/api/favorites/${id}/status`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setIsFavorite(statusRes.data.isFavorite);
                    } catch (statusErr) {
                        console.error("Lỗi kiểm tra trạng thái yêu thích:", statusErr.response?.data || statusErr);
                        if (!handleTokenError(statusErr)) {
                            setIsFavorite(false);
                        }
                    }
                } else {
                    setIsFavorite(false);
                }
            } catch (err) {
                console.error("Lỗi fetch dữ liệu phim:", err);
                toast.error("Không thể tải dữ liệu phim.");
                setMovie(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieData();
    }, [id, navigate]);

    const toggleFavorite = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
            navigate("/login");
            return;
        }
        try {
            if (isFavorite) {
                await axios.delete(`http://localhost:3001/api/favorites/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsFavorite(false);
                toast.success("Đã xóa khỏi danh sách yêu thích");
            } else {
                await axios.post(`http://localhost:3001/api/favorites`, { movie_id: id }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsFavorite(true);
                toast.success("Đã thêm vào danh sách yêu thích");
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật yêu thích:", err.response?.data || err);
            if (!handleTokenError(err)) {
                toast.error(
                    "Có lỗi khi cập nhật yêu thích: " + (err.response?.data?.message || err.message || "Thử lại sau")
                );
            }
        }
    };
    // Hàm xử lý gửi đánh giá mới 
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để gửi đánh giá!");
            navigate("/login");
            return;
        }

        try {
            await axios.post(
                "http://localhost:3001/api/reviews",
                { movie_id: id, rating, comment: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewComment("");
            setRating(10);
            const res = await axios.get(`http://localhost:3001/api/reviews/${id}`);
            setReviews(res.data);
            toast.success("Đánh giá thành công!");
        } catch (err) {
            toast.error(
                "Lỗi khi gửi đánh giá: " + (err.response?.data?.error || "Thử lại sau")
            );
        }
    };

    if (loading) return <div className="loading-indicator">Đang tải...</div>;
    if (!movie) return <div className="error-message">Không tìm thấy phim!</div>;

    const latestEpisodes = movie.episodes
        ? [...movie.episodes]
            .sort((a, b) => Number(b.episode) - Number(a.episode))
            .slice(0, 3)
        : [];
    const newestEpisode = movie.episodes && movie.episodes.length > 0
    ? [...movie.episodes].sort((a, b) => Number(b.episode) - Number(a.episode))[0]
    : null;

    return (
        <div className="movie-detail-page">
            {/* Background Image */}
            <div className="movie-background">
                <img src={movie.background_url} alt="Background" className="background-img" />
                <div className="movie-header">
                    <div className="movie-detail-poster">
                        <img src={movie.image_url} alt={movie.title} />
                        <div className="movie-button">
                            {newestEpisode ? (
                                <Link to={`/movie/${id}/episode/${newestEpisode.episode}`} className="watch-movie-btn">
                                    XEM PHIM
                                </Link>
                            ) : (
                                // Nếu không có tập phim nào, hiển thị nút bị vô hiệu hóa hoặc thông báo
                                <button className="watch-movie-btn disabled" disabled>
                                    KHÔNG CÓ TẬP NÀO
                                </button>
                            )}
                            <button
                                onClick={toggleFavorite}
                                className={`favorite-btn ${isFavorite ? "remove" : "add"}`}
                            >
                                {isFavorite ? "Xóa yêu thích" : "Thêm yêu thích"}
                            </button>
                        </div>
                    </div>
                    <div className="movie-info">
                        <h2>{movie.title}</h2>
                        <p className="movie-description">{movie.description}</p>
                        <div className="movie-details-list">
                            <p><strong>Thời lượng:</strong> {movie.duration}</p>
                            <p><strong>Thể loại:</strong> {movie.genre}</p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Tab Content */}
                <div className="movie-content">
                    <h2>Thông tin phim</h2>
                    <div className="episode-list">
                    <p>Tập mới: </p>
                        {latestEpisodes.length > 0 ? (
                            latestEpisodes.map((ep) => (
                        <Link
                            key={ep.episode_id}
                            // Thay đổi dòng này: thêm /episode/:episode_number vào URL
                            to={`/movie/${id}/episode/${ep.episode}`}
                            className="episode-button"
                        >
                            Tập {ep.episode}
                        </Link>
                            ))
                        ) : (
                            <p>Chưa có tập phim nào.</p>
                        )}
                    </div>


                </div>
            

            <div className="review-section">
                <h3>ĐÁNH GIÁ</h3>
                <form onSubmit={handleReviewSubmit}>
                    <div className="rating-input">
                        <label>Điểm đánh giá (1-10): </label>
                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            required
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                        </select>
                    </div>
                    <textarea
                        placeholder="Viết đánh giá của bạn..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                    ></textarea>
                    <button type="submit" className="review-button">
                        GỬI ĐÁNH GIÁ
                    </button>
                </form>
                <div className="reviews-list">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.review_id} className="review">
                                <p>
                                    <strong>{review.user_name}</strong> (
                                    {new Date(review.review_date).toLocaleString()}) -
                                    <span className="rating"> Điểm: {review.rating}/10</span>
                                </p>
                                <p>{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <p>Chưa có đánh giá nào.</p>
                    )}
                </div>
            </div>
        </div>
        
    );
};

export default MovieDetail;