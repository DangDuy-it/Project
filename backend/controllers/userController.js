const db = require('../config/db');

// API: Lấy danh sách tài khoản người dùng
const getUsers = (req, res) => {
    const sql = `SELECT user_id, user_name, email, role_id, created_at, TRIM(status) AS status
                FROM users
                WHERE role_id=4
                ORDER BY created_at DESC
                `;
  
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi lấy danh sách người dùng:', err);
            return res.status(500).json({ message: 'Lỗi lấy danh sách người dùng' });
        }
        res.status(200).json(results);
    });
};

// Lấy thông tin tài khoàn người dùng theo ID
const getUserById = (req, res) => {
    const userId = req.params.user_id;
    const sql = 'SELECT user_id, user_name, email, role_id, created_at, status FROM users WHERE user_id = ?';

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Lỗi lấy chi tiết user: ', err);
            return res.status(500).json({message: 'Lỗi máy chủ'});
        }
        if(result.length === 0) {
            return res.status(404).json({message: 'Không tìm thấy user'});
        }
        res.status(200).json(result[0]);
    });
};

// API: Cập nhật trạng thái người dùng ( Active or Banned )
const updateUserStatus = (req, res) => {
    const userId = req.params.user_id;
    const {status} = req.body;
    
    if(!status || (status !== 'Active' && status !== 'Banned')) {
        return res.status(400).json({error: 'Status không hợp lệ'});
    }

    const sql = 'UPDATE users SET status = ? WHERE user_id = ?';
    db.query(sql, [status, userId], (err, result) => {
        if (err) {
            console.error('Lỗi cập nhật trạng thái user: ', err);
            return res.status(500).json({error: err.message});
        }
        
        const getUserSql = 'SELECT user_id, user_name, email, role_id, created_at, TRIM(status) AS status FROM users WHERE user_id = ?';
        db.query(getUserSql, [userId], (err, results) => {
            if (err) {
                console.error('Lỗi lấy thông tin user sau cập nhật:', err);
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy user' });
            }
            res.status(200).json(results[0]);
        });
    });
};
const searchUsers= (req, res)=>{
    const searchTerm= req.query.userName;
    if (!searchTerm){
        return res.status(400).json({message:"Vui lòng cung cấp từ khóa tìm kiếm"})
    }
    const sql=`SELECT user_id,
                    user_name,
                    email,
                    role_id,
                    created_at,
                    TRIM(status) as status
                FROM users
                WHERE role_id=4 AND user_name LIKE ?
                ORDER BY created_at DESC`;
    const searchPattern = `%${searchTerm}%`;
    db.query(sql, [searchPattern], (err,results) =>{
        if (err){
            console.error('Lỗi tìm kiếm người dùng:', err);
            return res.status(500).json({message:"Lỗi máy chủ."});
        }
        if (results.length===0){
            return res.status(404).json({message:"Không tìm thấy người dùng phù hợp."});
        }
        res.status(200).json(results);
    });
    
}

module.exports = {
    getUsers,
    getUserById,
    updateUserStatus,
    searchUsers
};