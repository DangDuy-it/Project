import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EditMovie.css'; 

function EditMovie() {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);
    const [backgroundFile, setBackgroundFile] = useState(null);
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

    const [categories, setCategories] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [showTags, setShowTags] = useState(false);
    
    useEffect(() => {
        axios.get('http://localhost:3001/api/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error("Lỗi lấy thể loại:", err));
    }, []);
    // Lấy thông tin phim
    useEffect(() => {
        axios.get(`http://localhost:3001/api/movies/${movieId}/edit`)
            .then(res => {
                const data = res.data;
                console.log("Dữ liệu API trả về:", data); // In ra để kiểm tra
                const genres = Array.isArray(data.genre)
                    ? data.genre
                    : typeof data.genre === 'string'
                        ? data.genre.split(',').map(g => g.trim())
                        : [];
                setSelectedGenres(genres);
                setMovie({
                    title: data.title || '',
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
    const handleSubmit = async (e) => {
        e.preventDefault();

        if(selectedGenres.length===0){
            alert("Vui lòng chọn thể loại cho phim");
            return;
        }
        if (movie.status === "Approved") {
            try {
                const epRes = await axios.get(`http://localhost:3001/api/movies/${movieId}/edit`);
                if (!epRes.data || epRes.data.length === 0) {
                    alert("Phim chưa có tập phim. Không thể duyệt (Approved).");
                    return;
                }
            } catch (checkErr) {
                console.error("Lỗi kiểm tra tập phim:", checkErr);
                alert("Không thể kiểm tra tập phim. Thử lại sau.");
                return;
            }
        }
        const formData = new FormData();
        formData.append('title', movie.title);
        formData.append('genre', selectedGenres.join(','));
        formData.append('release_year', movie.release_year);
        formData.append('duration', movie.duration);
        formData.append('status', movie.status);
        formData.append('description', movie.description);

        if (imageFile) {
            formData.append('image', imageFile);
        } else {
            formData.append('existing_image_url', movie.image_url);
        }

        if (backgroundFile) {
            formData.append('background', backgroundFile);
        } else {
            formData.append('existing_background_url', movie.background_url); 
        }

        axios.put(`http://localhost:3001/api/movies/${movieId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(() => {
            alert("Cập nhật thành công!");
            navigate(-1);
        })
        .catch(err => {
                if (err.response && err.response.data?.message) {
                    alert(err.response.data.message); 
                } else {
                    alert("Đã xảy ra lỗi khi cập nhật thông tin phim.");
                }
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
                    </div>
                </div>
                {/* Các trường input như trước */}
                <div className="form-groups">
                    <div className="form-group">
                        <label htmlFor="title">Tên phim:</label>
                        <input type="text" id="title" name="title" value={movie.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Thể loại:</label>
                        <div className="genre-tag-wrapper">
                            <div className="genre-tag-input" onClick={() => setShowTags(!showTags)}>
                                {selectedGenres.length > 0 ? selectedGenres.join(', ') :"Chưa chọn thể loại nào"}
                            </div>
                            {showTags && (
                                <div className="genre-tags-popup">
                                    {categories.map(cat => (
                                        <div
                                            key={cat.category_id}
                                            className={`genre-tag ${selectedGenres.includes(cat.category_name) ? 'selected' : ''}`}
                                            onClick={() => {
                                                if (selectedGenres.includes(cat.category_name)) {
                                                    setSelectedGenres(selectedGenres.filter(name => name !== cat.category_name));
                                                } else {
                                                    setSelectedGenres([...selectedGenres, cat.category_name]);
                                                }
                                            }}
                                        >
                                            {cat.category_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Ảnh phim:</label>
                        <input type="file" id="image" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="background">Ảnh nền:</label>
                        <input type="file" id="background" accept="image/*" onChange={(e)=> setBackgroundFile(e.target.files[0])} />
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EditMovie;