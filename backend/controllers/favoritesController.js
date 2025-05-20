const db = require('../config/db');

// // API: Thêm phim vào danh sách yêu thích
const addFavorite=(req,res) => {
    const userId= req.user.user_id;
    const {movie_id} = req.body;

    //Kiểm tra movie_id có được gửi đến hay không 
    if (!movie_id) {
        return res.status(400).json({message: "Thiếu movie_id"})
    }
    // Câu lệnh SQL
    const sql= `INSERT IGNORE INTO favorites (user_id, movie_id) VALUES (?,?)`;
    db.query(sql, [userId, movie_id], (err, result) =>{
        // Phản hồi lỗi
        if(err){
            console.error("Lỗi thêm yêu thích",err)
            return res.status(500).json({message:"Lỗi máy chủ"})
        }
        if(result.affectedRows>0){
            res.status(201).json({message:"Đã thêm vào danh sách phim yêu thích"});
        }
        else {
            res.status(200).json({message:"Phim đã có trong danh sách yêu thích"});
        }
    });
}
// API: Xóa phim khỏi danh sách yêu thích
const removeFavorite=(req, res)=>{
    const userId= req.user.user_id;
    const movieId= req.params.movieId;
    //Kiểm tra movie_id có được gửi đến hay không
    if (!movieId){
        return res.status(400).json({message:"Thiếu movie_id"})
    }
    //Câu lệnh SQL
    const sql=`DELETE FROM favorites WHERE user_id=? AND movie_id=? `;
    db.query(sql, [userId, movieId], (err, result) =>{
        //Phản hổi lỗi
        if(err){
            console.error("Lỗi xóa yêu thích",err);
            return res.status(500).json({message:"Lỗi máy chủ"});
        }
        if (result.affectedRows>0){
            res.status(200).json({message:"Đã xóa phim khỏi danh sách yêu thích"});
        }
        else{
            res.status(404).json({message:"Phim không có trong danh sách yêu thích"});
        }
    });
};

// API: Kiểm tra trạng thái yêu thích của một phim
const checkFavoriteStatus=(req, res) =>{
    const userId= req.user.user_id;
    const movieId= req.params.movieId;
    //Kiểm tra movie_id được gửi đến không
    if(!movieId){
        return res.status(400).json({message:"Thiếu movie_id"});
    }
    //Câu lệnh SQL
    const sql=`SELECT 1 FROM favorites WHERE user_id=?  AND movie_id=? LIMIT 1`;
    db.query(sql, [userId, movieId], (err, result) =>{
        //Phản hồi lỗi
        if (err){
            console.error("Lỗi kiểm tra trạng thái yêu thích: ",err);
            return res.status(500).json({message:"Lỗi máy chủ"});
        }
        // Nếu results có dòng (length > 0), tức là phim đã được yêu thích
        const isFavorite= result.length>0;
        res.status(200).json({isFavorite: isFavorite});
    })
}
// API lấy danh sách phim yêu thích
const getFavorites=(req, res) =>{
    const userId= req.user.user_id;
    // Câu lệnh SQL
    const sql=`
        SELECT m.movie_id, m.title, m.description, m.image_url
        FROM favorites f
        JOIN movies m ON f.movie_id = m.movie_id
        WHERE f.user_id=?
    `
    db.query(sql, [userId], (err, result) =>{
        // Phản hồi lỗi
        if (err){
            console.error("Lỗi lấy danh sách phim yêu thích",err);
            return res.status(500).json({message:"Lỗi máy chủ"});
        }
        res.status(200).json(result);
    })
}


module.exports = {
    addFavorite,
    removeFavorite,
    checkFavoriteStatus,
    getFavorites,
};