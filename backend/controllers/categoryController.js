const db = require('../config/db');

// API: Lấy danh sách thể loại 
const getCategorys = (req, res)=>{
    const query =`
        SELECT 
            category_id,
            category_name
        FROM categories  
    `;
    db.query(query,(err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

module.exports={
    getCategorys
}