const jwt = require('jsonwebtoken');
const db = require('../config/db');

// API: Gửi đánh giá ( yêu cầu đăng nhập )
const createReview = (req, res) => {
    const { movie_id, rating, comment } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Vui lòng đăng nhập!" });
    }

    try {
        const decoded = jwt.verify(token, "your_secret_key");
        const user_id = decoded.user_id;
        const user_name = decoded.user_name;

        if (!movie_id || !rating || !comment) {
            return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin!" });
        }
        // Kiểm tra rating trong khoảng 1-10
        if (rating < 1 || rating > 10) {
            return res.status(400).json({ error: "Điểm đánh giá phải từ 1 đến 10!" });
        }

        db.query(
            "INSERT INTO reviews (movie_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)",
            [movie_id, user_id, user_name, rating, comment],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: "Đánh giá thành công!" });
            }
        );
    } catch (err) {
        res.status(401).json({ error: "Token không hợp lệ!" });
    }
};

// API: Lấy danh sách đánh giá của một phim
const getMovieReviews = (req, res) => {
    const movie_id = req.params.movie_id;

    db.query(
        'SELECT r.review_id, r.rating, r.comment, r.review_date, u.user_name FROM reviews r JOIN users u ON r.user_id = u.user_id WHERE r.movie_id = ? ORDER BY r.review_date DESC',
        [movie_id],
        (err, results) => {
            if (err) {
                console.log('Lỗi khi lấy đánh giá:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        }
    );
};

module.exports = {
    createReview,
    getMovieReviews
};