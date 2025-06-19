const db = require('../config/db');

// API: Lấy danh sách thể loại 
const getCategories = (req, res) => {
    const query = `
        SELECT
            category_id,
            category_name
        FROM categories
        ORDER BY category_name ASC
    `; 
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Thêm thể loại mới
const addCategory = (req, res) => {
    const { category_name } = req.body;
    if (!category_name) return res.status(400).json({ error: "Tên thể loại là bắt buộc." });

    const query = `INSERT INTO categories (category_name) VALUES (?)`;
    db.query(query, [category_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Thêm thể loại thành công!", id: result.insertId });
    });
};

// Cập nhật thể loại
const updateCategory = (req, res) => {
    const id = req.params.id;
    const { category_name } = req.body;

    const query = `UPDATE categories SET category_name = ? WHERE category_id = ?`;
    db.query(query, [category_name, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Cập nhật thể loại thành công!" });
    });
};

// Xóa thể loại
const deleteCategory = (req, res) => {
    const id = req.params.id;

    // Kiểm tra xem có phim nào đang dùng thể loại này không
    const checkQuery = `
        SELECT COUNT(*) AS count
        FROM movie_categories
        WHERE category_id = ?
    `;
    db.query(checkQuery, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const count = result[0].count;
        if (count > 0) {
            return res.status(400).json({
                error: 'Không thể xóa thể loại đang được sử dụng bởi các phim.'
            });
        }

        // Nếu không bị ràng buộc → tiếp tục xóa
        const deleteQuery = `DELETE FROM categories WHERE category_id = ?`;
        db.query(deleteQuery, [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Xóa thể loại thành công!' });
        });
    });
};

const getMoviesByCategoryName = (req, res) => {
  const categoryName = req.params.name ? decodeURIComponent(req.params.name) : null;

  if (!categoryName) {
    return res.status(400).json({ error: 'Thiếu tên thể loại.' });
  }

  const sql = `
    SELECT m.movie_id AS id,
           m.title,
           m.image_url,
           m.description
    FROM   movies m
    JOIN   movie_categories mc ON mc.movie_id = m.movie_id
    JOIN   categories c ON c.category_id = mc.category_id
    WHERE  c.category_name = ?
      AND  m.status = 'Approved'
    ORDER  BY m.movie_id DESC
  `;

  db.query(sql, [categoryName], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phim theo thể loại này.' });
    }

    res.status(200).json(results);
  });
};


module.exports={
    getCategories,
    getMoviesByCategoryName,
    addCategory,
    updateCategory,
    deleteCategory
}