const jwt = require('jsonwebtoken');
const db = require('../config/db');

// API: Gửi đánh giá (yêu cầu đăng nhập)
const createReview = (req, res) => {
    const { movie_id, rating, comment } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Vui lòng đăng nhập!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        const user_id = decoded.user_id;

        if (!movie_id || !rating || !comment) {
            return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin!" });
        }

        // Kiểm tra rating trong khoảng 1-10
        if (rating < 1 || rating > 10) {
            return res.status(400).json({ error: "Điểm đánh giá phải từ 1 đến 10!" });
        }

        // Chèn đánh giá vào bảng reviews (không có user_name)
        db.query(
            "INSERT INTO reviews (movie_id, user_id, rating, comment, review_date) VALUES (?, ?, ?, ?, NOW())",
            [movie_id, user_id, rating, comment],
            (err, result) => {
                if (err) {
                    console.log('Lỗi khi gửi đánh giá:', err);
                    return res.status(500).json({ error: err.message });
                }

                // Lấy thông tin đánh giá vừa tạo để trả về
                db.query(
                    "SELECT r.review_id, r.rating, r.comment, r.review_date, u.user_name FROM reviews r JOIN users u ON r.user_id = u.user_id WHERE r.review_id = ?",
                    [result.insertId],
                    (err, reviews) => {
                        if (err) {
                            console.log('Lỗi khi lấy đánh giá:', err);
                            return res.status(500).json({ error: err.message });
                        }
                        res.status(201).json({
                            message: "Đánh giá thành công!",
                            review: reviews[0]
                        });
                    }
                );
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