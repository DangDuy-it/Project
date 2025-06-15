import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import '../styles/WatchHistory.css';

function WatchHistory() {
    const [watchHistory, setWatchHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage]= useState(1);
    const moviesPerPage= 10;
    const navigate = useNavigate();

    // Hàm xử lý lỗi token
    const handleTokenError = (err) => {
        if (err.response && err.response.status === 403 && err.response.data?.error === 'Token không hợp lệ hoặc đã hết hạn') {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
            localStorage.removeItem("token");
            navigate("/login");
            return true;
        }
        return false;
    };

    useEffect(() => {
        setLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            toast.info("Vui lòng đăng nhập để xem lịch sử xem phim");
            setLoading(false);
            return;
        }

        // Hàm fetch danh sách lịch sử xem phim từ API
        const fetchWatchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/watch-history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWatchHistory(res.data);
            } catch (err) {
                console.error("Lỗi lấy danh sách lịch sử xem phim", err.response?.data || err);
                if (!handleTokenError(err)) {
                    toast.error("Không thể tải lịch sử xem phim");
                }
                setWatchHistory([]);
            } finally {
                setLoading(false);
            }
        };
        fetchWatchHistory();
    }, [navigate]);

    // Hàm xóa một bản ghi lịch sử
    const handleDeleteHistoryItem = async (movie_id) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.info("Vui lòng đăng nhập để xóa lịch sử xem phim");
            return;
        }

        try {
            await axios.delete(`http://localhost:3001/api/watch-history/${movie_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWatchHistory(watchHistory.filter(item => item.movie_id !== movie_id));
            toast.success("Đã xóa bản ghi lịch sử xem phim");
        } catch (err) {
            console.error("Lỗi xóa lịch sử xem phim:", err.response?.data || err);
            if (!handleTokenError(err)) {
                toast.error("Không thể xóa bản ghi lịch sử xem phim");
            }
        }
    };

    // Hàm xóa toàn bộ lịch sử
    const handleDeleteAllHistory = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem phim?")) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.info("Vui lòng đăng nhập để xóa lịch sử xem phim");
            return;
        }

        try {
            await axios.delete('http://localhost:3001/api/watch-history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWatchHistory([]);
            toast.success("Đã xóa toàn bộ lịch sử xem phim");
        } catch (err) {
            console.error("Lỗi xóa toàn bộ lịch sử xem phim:", err.response?.data || err);
            if (!handleTokenError(err)) {
                toast.error("Không thể xóa toàn bộ lịch sử xem phim");
            }
        }
    };
    // Tính tổng số trang
    const totalPages= Math.ceil(watchHistory.length/moviesPerPage);
    // Tính danh sách phim hiện thị theo trang 
    const indexOfLastMovie= currentPage * moviesPerPage;
    const indexOfFirstMovie= indexOfLastMovie - moviesPerPage;
    const currentMovies= watchHistory.slice(indexOfFirstMovie, indexOfLastMovie);

    const handlePageChange= (pageNumber) =>{
        setCurrentPage(pageNumber);
    }

    if (loading) {
        return <div>Đang tải lịch sử xem phim...</div>;
    }

    return (
        <div className="watch-history-container">
            <div className="header-container">
                <h2>Lịch sử xem phim của bạn</h2>
                {watchHistory.length > 0 && (
                    <button className="delete-all-button" onClick={handleDeleteAllHistory}>
                        Xóa toàn bộ lịch sử
                    </button>
                )}
            </div>
            {!loading && watchHistory.length === 0 ? (
                localStorage.getItem('token') ? (
                    <div className="no-history">Bạn chưa xem phim nào</div>
                ) : null
            ) : (
                <div className="movie-list-history">
                    {currentMovies.map(history => (
                        <div key={history.movie_id} className="movie-card-wrapper">
                            <Link to={`/movieDetail/${history.movie_id}`} className="movie-card-history">
                                <img src={history.image_url} alt={history.title} />
                                <div className="movie-title">{history.title}</div>
                                <div className="watched-at">Xem lúc: {new Date(history.watched_at).toLocaleString()}</div>
                            </Link>
                            <button
                                className="delete-button"
                                onClick={() => handleDeleteHistoryItem(history.movie_id)}
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div className="more">
                <ul>
                    {Array.from({length: totalPages}, (_, index) =>(
                        <li key={index}>
                            <button className={`page-button ${currentPage === index +1 ? 'active' :''}`} 
                                onClick={()=> handlePageChange(index+1)}
                                >
                                {index+1}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default WatchHistory;