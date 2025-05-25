import React,{useEffect, useState} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {Link, useNavigate } from "react-router-dom";
import '../styles/Favorites.css';


function Favorites(){
    const [favoriteMovies, setFavoriteMovies]= useState([]);
    const [loading, setLoading]= useState(true);
    const navigate= useNavigate();
    

    useEffect(()=>{
        // Hàm xử lý lỗi token
        const handleTokenError= (err) =>{
            // Kiểm tra lỗi nếu có response từ server, mã trạng thái 403 và tbao lỗi cụ thể mà backend trả về
            if(err.response && err.response.status === 403 && err.response.data?.error==='Token không hợp lệ hoặc đã hết hạn'){
            // Hiện thị thông báo lỗi
                toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại")
            // Xóa token cũ/hết hạn
                localStorage.removeItem("token");
            // Điều hướng về trang đăng nhập
                navigate("/login");
                return true;
            }
            return false;
        };
        setLoading(true);

        const token= localStorage.getItem('token');
        // Kiểm tra nếu không có token
        if(!token){
            toast.info("Vui lòng đăng nhập để xem danh sách yêu thích");
            setLoading(false);

            return;
        }
        // Hàm fetch danh sách phim yêu thích từ API
        const fetchFavoriteMovies= async ()=>{
            try{
                // Gọi API backend GET /api/favorites
                const res= await axios.get('http://localhost:3001/api/favorites',{
                    headers:{Authorization:`Bearer ${token}`}
                });
                setFavoriteMovies(res.data);
            }catch(err){
                console.error("Lỗi lấy danh sách phim yêu thích",err.response?.data||err);
                // Sử dụng hàm xử lý lỗi token
                if(!handleTokenError(err)) {
                    // Nếu không phỉa lỗi token, hiện thị thông báo lỗi chung
                    toast.error("Không thể tải danh sách phim yêu thích")
                }
                setFavoriteMovies([]); // Đảm bảo danh sách rỗng khi có lỗi
            } finally{
                setLoading(false); // Dừng loading sau khi fetch xog hoặc gặp lỗi
            }
        };
        fetchFavoriteMovies();
    },[navigate]);
    
    if(loading){
        return <div>Đang tải danh sách phim yêu thích...</div>
    }
    return(
        <div className="favorite-movies-container">
            <h2>Danh sách phim yêu thích của bạn</h2>
            {/* Kiểm tra nếu không loading và danh sách rỗng */}
            {!loading && favoriteMovies.length===0 ? (
                // Kiểm tra lại token để chắc chắn người dùng đã đăng nhập trước đó
                localStorage.getItem('token') ? (
                    <div className="no-favorites">Bạn chưa có phim trong danh sách yêu thích</div>
                ):null // Nếu chưa đăng nhập, hiện thị thông báo trên
            ):(
                //Nếu không loading và danh sách không rỗng, hiện thị danh sách phim
                <div className="movie-list">
                    {favoriteMovies.map(movie =>(
                        <Link key={movie.movie_id} to = {`/movieDetail/${movie.movie_id}`} className="movie-card">
                            <img src={movie.image_url} alt={movie.title} />
                            <div className="movie-title">{movie.title}</div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
export default Favorites;