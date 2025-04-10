import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/MoviePlayer.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MoviePlayer = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [rating, setRating] = useState(10);
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/movies/${id}`);
                const data = await res.json();
                if (data.episodes && Array.isArray(data.episodes)) {
                    setMovie(data);
                    if (data.episodes.length > 0) {
                        setCurrentEpisode(data.episodes[0]);
                        recordHistory(data.title, id);
                    }
                } else {
                    setMovie({ ...data, episodes: [] });
                }
            } catch (err) {
                console.error("Lỗi:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/api/reviews/${id}`);
                setReviews(res.data);
            } catch (err) {
                console.error("Lỗi lấy đánh giá:", err);
            }
        };

        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        setIsFavorite(favorites.includes(id));

        fetchMovie();
        fetchReviews();
    }, [id]);

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

    const toggleFavorite = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
            navigate("/login");
            return;
        }

        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        if (isFavorite) {
            const newFavorites = favorites.filter((fav) => fav !== id);
            localStorage.setItem("favorites", JSON.stringify(newFavorites));
            setIsFavorite(false);
            toast.success("Đã xóa khỏi danh sách yêu thích!");
        } else {
            favorites.push(id);
            localStorage.setItem("favorites", JSON.stringify(favorites));
            setIsFavorite(true);
            toast.success("Đã thêm vào danh sách yêu thích!");
        }
    };

    const recordHistory = (title, movieId) => {
        const history = JSON.parse(localStorage.getItem("watchHistory") || "[]");
        const newEntry = { id: movieId, title, timestamp: new Date().toISOString() };
        const updatedHistory = [
            newEntry,
            ...history.filter((item) => item.id !== movieId),
        ].slice(0, 10);
        localStorage.setItem("watchHistory", JSON.stringify(updatedHistory));
    };

    if (loading) return <div>Đang tải...</div>;
    if (!movie) return <div>Không tìm thấy phim!</div>;

    return (
        <div className="movie-player-container">
            <div className="breadcrumb">
                <Link to="/">Trang chủ</Link> / <span>{movie.title}</span> /{" "}
                <span>{currentEpisode?.title}</span>
            </div>
            <div className="video-player">
                <iframe
                    key={currentEpisode?.episode_id}
                    width="100%"
                    height="400"
                    src={currentEpisode?.video_url}
                    title={movie.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
            <div className="episode-list">
                <h3>DANH SÁCH TẬP</h3>
                <div className="episodes">
                    {Array.isArray(movie.episodes) && movie.episodes.length > 0 ? (
                        movie.episodes.map((ep) => (
                            <button
                                key={ep.episode_id}
                                className={
                                    Number(ep.episode) === Number(currentEpisode?.episode)
                                        ? "active"
                                        : ""
                                }
                                onClick={() => {
                                    setCurrentEpisode(ep);
                                    recordHistory(movie.title, id);
                                }}
                            >
                                Tập {ep.episode}
                            </button>
                        ))
                    ) : (
                        <p>Chưa có tập phim nào.</p>
                    )}
                </div>
            </div>
            <div className="movie-info">
                <div className="poster-container">
                    <img src={movie.image_url} alt={movie.title} className="movie-poster" />
                    <button
                        onClick={toggleFavorite}
                        className={`favorite-btn ${isFavorite ? "remove-favorite" : "add-favorite"}`} // Thêm class động
                    >
                        {isFavorite
                            ? "Xóa khỏi danh sách yêu thích"
                            : "Thêm vào danh sách yêu thích"}
                    </button>
                </div>
                <div className="movie-details">
                    <h3>{movie.title}</h3>
                    <p>{movie.description}</p>
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

export default MoviePlayer;