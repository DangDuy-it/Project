import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/TheLoai.css';

function TheLoai() {
    const { category_name } = useParams();
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categoryTitle, setCategoryTitle] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const categoriesRes = await axios.get('http://localhost:3001/api/categories');
                const category = categoriesRes.data.find(
                    cat => cat.category_name.toLowerCase() === category_name.toLowerCase()
                );
                if (!category) throw new Error('Thể loại không tồn tại');
                setCategoryTitle(category.category_name.toUpperCase());

                const relationsRes = await axios.get('http://localhost:3001/api/movie_categories');
                const movieIds = relationsRes.data
                    .filter(rel => rel.category_id === category.category_id)
                    .map(rel => rel.movie_id);

                const moviesRes = await axios.get('http://localhost:3001/api/movies');
                const filteredMovies = movieIds.length > 0
                    ? moviesRes.data.filter(movie => movieIds.includes(movie.id))
                    : [];
                setAnimeList(filteredMovies);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [category_name]);

    if (isLoading) return <div className="loading">Đang tải...</div>;
    if (animeList.length === 0) return <div className="no-anime">Không có phim nào trong thể loại này</div>;

    return (
        <div className="category-list-main">
            <div className="tag">
                <li>THỂ LOẠI: {categoryTitle}</li>
            </div>
            <div className="anime-grid">
                {animeList.map((item) => (
                    <Link 
                        to={`/movie/${item.id}`} 
                        key={item.id}
                        style={{ textDecoration: 'none' }}
                    >
                        <MovieItem 
                            title={item.title} 
                            image_url={item.image_url || item.thumbnail} 
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

function MovieItem({ title, image_url }) {
    return (
        <div className="anime-card">
            <div className="anime-image">
                <img 
                    src={image_url || '/placeholder.jpg'} 
                    alt={title}
                    onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                    }}
                />
            </div>
            <div className="anime-title">{title}</div>
        </div>
    );
}

export default TheLoai;
