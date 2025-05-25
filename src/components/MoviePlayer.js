import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../styles/MoviePlayer.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MoviePlayer = () => {
    const { id, episodeNumber } = useParams();
    const [movie, setMovie] = useState(null);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [rating, setRating] = useState(10);
    const navigate = useNavigate();
    const isHistoryRecorded = useRef(false);

    const handleTokenError = (err) => {
        if (err.response && err.response.status === 403 && err.response.data?.error === 'Token không hợp lệ hoặc đã hết hạn') {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            localStorage.removeItem("token");
            navigate("/login");
            return true;
        }
        return false;
    };

    const recordHistoryToDB = async (movieId) => {
        if (isHistoryRecorded.current) {
            console.log("Lịch sử đã được ghi trước đó, bỏ qua.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            console.log("Không có token, bỏ qua ghi lịch sử.");
            toast.error("Vui lòng đăng nhập để ghi lịch sử xem phim!");
            return;
        }

        if (!movieId) {
            console.log("movieId không hợp lệ:", movieId);
            toast.error("Không thể ghi lịch sử: movieId không hợp lệ");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:3001/api/watch-history",
                { movie_id: movieId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Phản hồi từ server:", response.data);
            toast.success("Đã ghi lịch sử xem phim thành công!");
            isHistoryRecorded.current = true;
        } catch (err) {
            console.error("Lỗi chi tiết khi ghi lịch sử:", err.response?.data || err.message);
            if (!handleTokenError(err)) {
                toast.error("Không thể ghi lịch sử xem phim: " + (err.response?.data?.error || err.message));
            }
        }
    };

    useEffect(() => {
        console.log("useEffect chạy với id:", id, "và episodeNumber:", episodeNumber);
        let isMounted = true;

        const fetchMovieData = async () => {
            try {
                const movieRes = await fetch(`http://localhost:3001/api/movies/${id}`);
                const movieData = await movieRes.json();
                console.log("Dữ liệu phim chi tiết:", movieData);

                if (!isMounted) return;

                if (movieData.episodes && Array.isArray(movieData.episodes)) {
                    setMovie(movieData);
                    let episodeToPlay = null;
                    if (episodeNumber) {
                        episodeToPlay = movieData.episodes.find(
                            (ep) => Number(ep.episode) === Number(episodeNumber)
                        );
                    }
                    if (!episodeToPlay && movieData.episodes.length > 0) {
                        episodeToPlay = movieData.episodes[0];
                    }
                    setCurrentEpisode(episodeToPlay);
                } else {
                    setMovie({ ...movieData, episodes: [] });
                }

                if (movieData && movieData.title && id && !isHistoryRecorded.current) {
                    await recordHistoryToDB(id);
                }

                const reviewsRes = await axios.get(`http://localhost:3001/api/reviews/${id}`);
                if (isMounted) {
                    setReviews(reviewsRes.data);
                }
            } catch (err) {
                console.error("Lỗi fetch dữ liệu phim:", err);
                if (isMounted) {
                    toast.error("Không thể tải dữ liệu phim.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchMovieData();

        return () => {
            isMounted = false;
            isHistoryRecorded.current = false;
        };
    }, [id, episodeNumber]);

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
            toast.error("Lỗi khi gửi đánh giá: " + (err.response?.data?.error || "Thử lại sau"));
        }
    };

    const handleEpisodeClick = (ep) => {
        console.log("handleEpisodeClick được gọi với ep:", ep, "movie_id:", id);
        setCurrentEpisode(ep);
        navigate(`/movie/${id}/episode/${ep.episode}`, { replace: true });
        if (!isHistoryRecorded.current) {
            recordHistoryToDB(id);
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (!movie) return <div>Không tìm thấy phim!</div>;

    return (
        <div className="movie-player-container">
            <div className="breadcrumb">
                <Link to="/">Trang chủ</Link> / <Link to={`/movie-detail/${id}`}>{movie.title}</Link> /{" "}
                <span>{currentEpisode?.title || `Tập ${currentEpisode?.episode}`}</span>
            </div>
            <div className="video-player">
                <iframe
                    key={currentEpisode?.episode_id}
                    width="100%"
                    height="400"
                    src={currentEpisode?.video_url}
                    title={movie.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
            <div className="episode-list">
                <h3>DANH SÁCH TẬP</h3>
                <div className="episodes">
                    {Array.isArray(movie.episodes) && movie.episodes.length > 0 ? (
                        movie.episodes.map((ep, index) => (
                            <button
                                key={`episode-${index}`}
                                className={Number(ep.episode) === Number(currentEpisode?.episode) ? "active" : ""}
                                onClick={() => handleEpisodeClick(ep)}
                            >
                                Tập {ep.episode}
                            </button>
                        ))
                    ) : (
                        <p>Không có tập phim nào để hiển thị.</p>
                    )}
                </div>
            </div>
            <div className="movie-player-info">
                <div className="poster-container">
                    <img src={movie.image_url} alt={movie.title} className="movie-poster" />
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
                        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} required>
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
                        reviews.map((review, index) => (
                            <div key={`review-${index}`} className="review">
                                <p>
                                    <strong>{review.user_name}</strong> ({new Date(review.review_date).toLocaleString()}) -{" "}
                                    <span className="rating">Điểm: {review.rating}/10</span>
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