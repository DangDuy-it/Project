import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/List.css';

function List() {
    const [animeList, setAnimeList] = useState([]);
    const [currentPage, setCurrentPage]= useState(1);
    const moviesPerPage= 15;

    useEffect(() => {
        axios.get('http://localhost:3001/api/movies')
            .then(res => {
                setAnimeList(res.data);
            })
            .catch(err => console.error("Lỗi:", err));
    }, []);

    // Tính tổng số trang
    const totalPages= Math.ceil(animeList.length/moviesPerPage);
    // Tính danh sách phim hiện thị theo trang 
    const indexOfLastMovie= currentPage * moviesPerPage;
    const indexOfFirstMovie= indexOfLastMovie - moviesPerPage;
    const currentMovies= animeList.slice(indexOfFirstMovie, indexOfLastMovie);

    const handlePageChange= (pageNumber) =>{
        setCurrentPage(pageNumber);
    }

    return (
        <div className="list-main">
            <div className="list-tag">
                <li>MỚI CẬP NHẬT</li>
            </div>
            <div className="list">
                {currentMovies.map((item) => (
                    <li>
                    <Link 
                        to={`/movieDetail/${item.id}`} 
                        key={item.id}
                    >
                        <AnimeItem 
                            title={item.title} 
                            image_url={item.image_url} 
                        />
                    </Link>   
                    </li>
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