import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ListMovie.css';
import { Link } from 'react-router-dom';

function AdminList() {
    const [animeList, setAnimeList] = useState([]);
    const [currentPage, setCurrentPage]= useState(1);
    const moviesPerPage= 5;
    useEffect(() => {
        axios.get('http://localhost:3001/api/moviesad')
            .then(res => {
                setAnimeList(res.data);
            })
            .catch(err => console.error("Lỗi:", err));
    }, []);
    const totalPages= Math.ceil(animeList.length/moviesPerPage);
    // Tính danh sách phim hiện thị theo trang 
    const indexOfLastMovie= currentPage * moviesPerPage;
    const indexOfFirstMovie= indexOfLastMovie - moviesPerPage;
    const currentMovies= animeList.slice(indexOfFirstMovie, indexOfLastMovie);

    const handlePageChange= (pageNumber) =>{
        setCurrentPage(pageNumber);
    }
    return (
        <div className="list-movies">
            <div className="list-movie-tag">
                <li>Quản lý phim</li>
            </div>
            <div className="button-add">
                <Link to={`/admin/add`}>
                    <button>THÊM PHIM</button>
                </Link>
            </div>
            <div className="list-movie">
                {currentMovies.map((item) => (
                    <AnimeItem
                        key={item.movie_id}
                        movie_id={item.movie_id}
                        title={item.title}
                        image_url={item.image_url}
                        genre={item.genre}
                        year={item.year}
                        duration={item.duration}
                        episodes={item.episodes}
                        status={item.status}
                    />
                ))}
            </div>
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

function AnimeItem({movie_id, title, image_url, genre, year, duration, episodes, status }) {
    // Định dạng trạng thái
    const getStatusClass = () => {
        if (status === 'Approved') return 'approved';
        if (status === 'Pending') return 'pending';
        return 'review';
    };
    //
    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc muốn xóa phim này không?")) {
            axios.delete(`http://localhost:3001/api/movies/${movie_id}`)
                .then(() => {
                    alert("Xóa phim thành công!");
                    window.location.reload(); // Load lại danh sách
                })
                .catch(err => {
                    console.error("Lỗi khi xóa:", err);
                    alert("Xóa thất bại!");
                });
        }
    };

    return (
        <div className="movie-item">
            <div className="movie-image">
                <img
                    src={image_url || '/placeholder.jpg'}
                    alt={title}
                    onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                    }}
                />
            </div>
            <div className="movie-info">
                <p><strong>Tên phim:</strong> {title}</p>
                <p><strong>Thể loại:</strong> {genre}</p>
                <p><strong>Năm phát hành:</strong> {year}</p>
                <p><strong>Thời lượng:</strong> {duration} phút</p>
                {episodes && <p><strong>Số tập:</strong> {episodes} ( Đang cập nhật )</p>}
                <div className={`status ${getStatusClass()}`}>
                    <span className="dot" />
                    Trạng thái: {status}
                </div>
            </div>
            <div className="actions">
                <Link to={`/admin/edit/${movie_id}`}>
                    <button>Sửa thông tin phim</button>
                </Link>
                <button onClick={() => handleDelete(movie_id)}>Xóa Phim</button>
                <Link to={`/admin/episodes/${movie_id}`}>
                    <button>Quản lý tập phim</button>
                </Link>
            </div>

        </div>
    );
}

export default AdminList;