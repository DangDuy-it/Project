import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EditMovie.css'; 

function EditMovie() {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState({
        title: '',
        genre: '',
        release_year: '',
        duration: '',
        status: '',
        description:'',
        image_url: '',
        background_url:'',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Lấy thông tin phim
    useEffect(() => {
        axios.get(`http://localhost:3001/api/movies/${movieId}/edit`)
            .then(res => {
                const data = res.data;
                console.log("Dữ liệu API trả về:", data); // In ra để kiểm tra
                const genres = Array.isArray(data.genre) ? data.genre.join(', ') : data.genre || '';
                setMovie({
                    title: data.title || '',
                    genre: genres,
                    release_year: data.release_year?.toString() || '',
                    duration: data.duration?.toString() || '',
                    status: data.status || '',
                    description: data.description || '',
                    image_url: data.image_url || '',
                    background_url: data.background_url || '',
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Lỗi lấy dữ liệu:', err);
                setError('Đã xảy ra lỗi khi tải thông tin phim.');
                setLoading(false);
            });
    }, [movieId]);
    // Xử lý thay đổi 
    const handleChange = (e) => {
        setMovie({ ...movie, [e.target.name]: e.target.value });
    };
    // Cập nhật thông tin phim
    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`http://localhost:3001/api/movies/${movieId}`, movie)
            .then(() => {
                alert("Cập nhật thành công!");
                navigate('/managemovie');
            })
            .catch(err => {
                console.error("Lỗi cập nhật:", err);
                setError('Đã xảy ra lỗi khi cập nhật thông tin phim.');
            });
    };

    if (loading) {
        return <div>Đang tải thông tin phim...</div>;
    }
    if (error) {
        return <div>Lỗi: {error}</div>;
    }

    return (
        <div className="edit-movie-container">
            <h2>Sửa Thông Tin Phim</h2>
            <form onSubmit={handleSubmit} className="edit-movie-form">
                <div className="left-section">
                    <div className="image">
                        <img
                            src={movie.image_url || '/placeholder.jpg'}
                            alt={movie.title}
                            onError={(e) => {
                            e.target.src = '/placeholder.jpg';
                            }}
                        />
                    </div>
                    <div className="button-container">
                        <button type="submit" className="save-button">Lưu thay đổi</button>
                        <button type="button" onClick={() => navigate('/managemovie')} className="cancel-button">Hủy</button>
                        <button type="button" onClick={()=> navigate(`/admin/add/${movieId}/episode`)} className='add-episode-button'>Thêm tập phim</button>
                    </div>
                </div>
                {/* Các trường input như trước */}
                <div className="form-groups">
                    <div className="form-group">
                        <label htmlFor="title">Tên phim:</label>
                        <input type="text" id="title" name="title" value={movie.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="genre">Thể loại:</label>
                        <input type="text" id="genre" name="genre" value={movie.genre} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="release_year">Năm phát hành:</label>
                        <input type="number" id="release_year" name="release_year" value={movie.release_year} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="duration">Thời lượng (Phút):</label>
                        <input type="number" id="duration" name="duration" value={movie.duration} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Mô tả:</label>
                        <input type="text" id="description" name="description" value={movie.description} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Trạng thái:</label>
                        <select id="status" name="status" value={movie.status} onChange={handleChange}>
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="image_url">URL ảnh:</label>
                        <input type="text" id="image_url" name="image_url" value={movie.image_url} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="background_url">URL ảnh:</label>
                        <input type="text" id="background_url" name="background_url" value={movie.background_url} onChange={handleChange} />
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EditMovie;