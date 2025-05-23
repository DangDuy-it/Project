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

    db.beginTransaction((err) => {
        if (err) {
            console.error("Lỗi bắt đầu transaction:", err.message);
            return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
        }

        const deleteSql = `DELETE FROM watchhistory WHERE user_id = ? AND movie_id = ?`;
        db.query(deleteSql, [userId, movie_id], (err, deleteResult) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Lỗi xóa lịch sử cũ:", err.message, err.sqlMessage);
                    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
                });
            }

            const insertSql = `INSERT INTO watchhistory (user_id, movie_id, watched_at) VALUES (?, ?, NOW())`;
            db.query(insertSql, [userId, movie_id], (err, insertResult) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Lỗi thêm lịch sử mới:", err.message, err.sqlMessage);
                        return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
                    });
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Lỗi commit transaction:", err.message);
                            return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
                        });
                    }
                    res.status(201).json({ message: "Đã ghi lịch sử xem phim" });
                });
            });
        });
    });
};

// API: Xóa một bản ghi lịch sử xem phim
const deleteWatchHistoryItem = (req, res) => {
    const userId = req.user.user_id;
    const { movie_id } = req.params;

    const sql = `DELETE FROM watchhistory WHERE user_id = ? AND movie_id = ?`;
    db.query(sql, [userId, movie_id], (err, result) => {
        if (err) {
            console.error("Lỗi xóa lịch sử xem phim:", err.message, err.sqlMessage);
            return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy bản ghi lịch sử" });
        }
        res.status(200).json({ message: "Đã xóa bản ghi lịch sử xem phim" });
    });
};

// API: Xóa toàn bộ lịch sử xem phim
const deleteAllWatchHistory = (req, res) => {
    const userId = req.user.user_id;

    const sql = `DELETE FROM watchhistory WHERE user_id = ?`;
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("Lỗi xóa toàn bộ lịch sử xem phim:", err.message, err.sqlMessage);
            return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
        }
        res.status(200).json({ message: "Đã xóa toàn bộ lịch sử xem phim" });
    });
};

module.exports = {
    getWatchHistory,
    addWatchHistory,
    deleteWatchHistoryItem,
    deleteAllWatchHistory,
};