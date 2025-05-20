const db = require('../config/db');

// API: Lấy danh sách lịch sử xem phim
const getWatchHistory = (req, res) => {
    const userId = req.user.user_id;
    const sql = `
        SELECT m.movie_id, m.title, m.description, m.image_url, wh.watched_at
        FROM watchhistory wh
        JOIN movies m ON wh.movie_id = m.movie_id
        WHERE wh.user_id = ?
        ORDER BY wh.watched_at DESC
    `;
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("Lỗi lấy danh sách lịch sử xem phim:", err.message, err.sqlMessage);
            return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
        }
        res.status(200).json(result);
    });
};

// API: Thêm lịch sử xem phim
const addWatchHistory = (req, res) => {
    const userId = req.user.user_id;
    const { movie_id } = req.body;

    if (!movie_id) {
        return res.status(400).json({ message: "Thiếu movie_id" });
    }

    const sql = `INSERT INTO watchhistory (user_id, movie_id, watched_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE watched_at = NOW()`;
    db.query(sql, [userId, movie_id], (err, result) => {
        if (err) {
            console.error("Lỗi thêm lịch sử xem phim:", err.message, err.sqlMessage);
            return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
        }
        res.status(201).json({ message: "Đã ghi lịch sử xem phim" });
    });
};

module.exports = {
    getWatchHistory,
    addWatchHistory,
};