import axios from "axios";
import "../styles/AddMovie.css";
import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";

function AddMovie(){ 
    const [formData, setFormData] = useState({
        title: '',
        genre:'',
        release_year:'',
        duration:'',
        description:'',
        image_url:'',
        background_url:'',
        status: 'Pending'
    });
    const [showTags, setShowTags] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);

    useEffect(() => {
    axios.get('http://localhost:3001/api/categories')
        .then((res) => setCategories(res.data))
        .catch((err) => console.error("Lỗi khi lấy thể loại:", err));
    }, []);
    const navigate= useNavigate();
    // Hàm xử lý thay đổi giá trị của input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData({ ...formData, [name]: files[0] });  // Lưu file (1 file duy nhất)
    };
    // Hàm xử lý khi form được submit 
    const handleSubmit = (e) => {
        e.preventDefault();

        // Kiểm tra dữ liệu bắt buộc
        if (
            !formData.title || !formData.description || !formData.release_year ||
            !formData.duration || selectedGenres.length === 0 || !formData.image || !formData.background
        ) {
            alert("Vui lòng điền đầy đủ thông tin và chọn ảnh!");
            return;
        }

        const formPayload = new FormData();
        formPayload.append("title", formData.title);
        formPayload.append("genre", selectedGenres.join(','));
        formPayload.append("release_year", parseInt(formData.release_year));
        formPayload.append("duration", parseInt(formData.duration));
        formPayload.append("description", formData.description);
        formPayload.append("status", formData.status);
        formPayload.append("image", formData.image);             
        formPayload.append("background", formData.background);   

        axios
            .post("http://localhost:3001/api/movies/add", formPayload, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            .then((response) => {
                alert("Thêm phim thành công!");
                navigate(-1);
            })
            .catch((error) => {
                console.error("Lỗi khi thêm phim:", error);
                if (error.response?.data?.error) {
                    alert(`Thêm phim thất bại: ${error.response.data.error}`);
                } else {
                    alert("Thêm phim thất bại. Vui lòng thử lại.");
                }
            });
    };
    return (
        <div className="add-movie-container">
            <h2>Thêm Thông Tin Phim</h2>
            {/* Thêm onSubmit handler vào form */}
            <form className="add-movie-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tên phim:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                <label>Thể loại:</label>
                <div className="genre-tag-wrapper">
                    <div
                    className="genre-tag-input"
                    onClick={() => setShowTags(!showTags)}
                    >
                    {selectedGenres.length > 0 ? selectedGenres.join(', ') : "Chọn thể loại"}
                    </div>

                    {showTags && (
                    <div className="genre-tags-popup">
                        {categories.map((cat) => (
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
                    <label>Năm phát hành:</label>
                    <input
                        type="number"
                        id="release_year"
                        name="release_year"
                        value={formData.release_year}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Thời lượng (phút):</label>
                    <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                 <div className="form-group">
                    <label>Mô tả:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Poster (Ảnh phim):</label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Ảnh nền (Background):</label>
                    <input
                        type="file"
                        name="background"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                    />
                </div>
                <div className="button-container">
                    <button type="submit" className="submit-button">Thêm Phim</button>
                    <button type="button" onClick={() => navigate(-1)} className="cancel-button">Hủy</button>
                </div>
            </form>
        </div>
    )
}
export default AddMovie;