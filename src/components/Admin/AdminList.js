import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AdminList.css';

function AdminList() {
    const [animeList, setAnimeList] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/api/movies')
            .then(res => {
                setAnimeList(res.data);
            })
            .catch(err => console.error("Lỗi:", err));
    }, []);

    return (
        <div className="admin-list-main">
            <div className="admin-list">
                {animeList.map((item) => (
                    <AnimeItem
                        key={item.id}
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
        </div>
    );
}

function AnimeItem({ title, image_url, genre, year, duration, episodes, status }) {
    const getStatusClass = () => {
        if (status === 'approved') return 'approved';
        if (status === 'pending') return 'pending';
        return 'review';
    };

    return (
        <div className="admin-anime-item">
            <div className="admin-anime-image">
                <img
                    src={image_url || '/placeholder.jpg'}
                    alt={title}
                    onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                    }}
                />
            </div>
            <div className="admin-anime-info">
                <p><strong>Tên phim:</strong> {title}</p>
                <p><strong>Thể loại:</strong> {genre}</p>
                <p><strong>Năm phát hành:</strong> {year}</p>
                <p><strong>Thời lượng:</strong> {duration} phút</p>
                {episodes && <p><strong style={{ color: 'lightgreen' }}>Số tập:</strong> {episodes} (đang cập nhật)</p>}
                <div className={`admin-status ${getStatusClass()}`}>
                    <span className="admin-dot" />
                    Trạng thái: {status}
                </div>
            </div>
            <div className="admin-actions">
                <button>Sửa thông tin phim</button>
                <button>Xóa Phim</button>
            </div>
        </div>
    );
}

export default AdminList;
