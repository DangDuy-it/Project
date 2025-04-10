import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/AnimeList.css';

function List() {
    const [animeList, setAnimeList] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/api/movies')
            .then(res => {
                setAnimeList(res.data);
            })
            .catch(err => console.error("Lỗi:", err));
    }, []);

    return (
        <div className="list-main">
            <div className="tag">
                <li>MỚI CẬP NHẬT</li>
            </div>
            <div className="list">
                {animeList.map((item) => (
                    <Link 
                        to={`/movie/${item.id}`} 
                        key={item.id}
                        style={{ textDecoration: 'none' }}
                    >
                        <AnimeItem 
                            title={item.title} 
                            image_url={item.image_url} 
                        />
                    </Link>
                ))}
            </div>
            <div className="more">
                <ul>
                    <li><button className="page-link">1</button></li>
                    <li><button className="page-link">2</button></li>
                </ul>
            </div>
        </div>
    );
}

function AnimeItem({ title, image_url }) {
    return (
        <div className="anime-item">
            <div className="anime-image">
                <img 
                    src={image_url || '/placeholder.jpg'} 
                    alt={title}
                    onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                    }}
                />
            </div>
            <div className="anime-info">
                <h3 className="title">{title}</h3>
            </div>
        </div>
    );
}

export default List;