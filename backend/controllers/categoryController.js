const db = require('../config/db');

// API: Lấy danh sách thể loại 
const getCategories = (req, res) => {
    const query = `
        SELECT
            category_id,
            category_name
        FROM categories
    `; 
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
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
    getMoviesByCategoryName
}