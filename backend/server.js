const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Thêm jsonwebtoken

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/images', express.static('public/images'));
app.use('/video', express.static('public/video'));

// Kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'web'
});

db.connect((err) => {
    if (err) {
        console.log("Lỗi kết nối:", err);
    } else {
        console.log("Đã kết nối MySQL!");
    }
});

// Middleware để xác thực token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy token từ header "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Không có token, vui lòng đăng nhập' });
    }

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        req.user = user; // Lưu thông tin user vào request
        next();
    });
};

// API: Đăng ký người dùng
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    console.log('Dữ liệu nhận được:', { name, email, password });

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    try {
        db.query('SELECT * FROM users WHERE email = ? OR user_name = ?', [email, name], async (err, result) => {
            if (err) {
                console.log('Lỗi kiểm tra email/user_name:', err);
                return res.status(500).json({ error: err.message });
            }
            if (result.length > 0) {
                const existingUser = result[0];
                if (existingUser.email === email) {
                    return res.status(400).json({ error: 'Email đã được sử dụng' });
                }
                if (existingUser.user_name === name) {
                    return res.status(400).json({ error: 'Tên người dùng đã được sử dụng' });
                }
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            db.query(
                'INSERT INTO users (user_name, email, password, role_id) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, 4],
                (err, result) => {
                    if (err) {
                        console.log('Lỗi khi thêm user:', err);
                        return res.status(500).json({ error: err.message });
                    }

                    // Tạo JWT token cho người dùng mới
                    const user = { user_id: result.insertId, user_name: name, email };
                    const token = jwt.sign(user, 'your_secret_key', { expiresIn: '1h' });

                    res.status(201).json({
                        message: 'Đăng ký thành công!',
                        token,
                        user
                    });
                }
            );
        });
    } catch (err) {
        console.log('Lỗi server:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API: Đăng nhập người dùng
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        const user = result[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { user_id: user.user_id, user_name: user.user_name, email: user.email },
            'your_secret_key',
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Đăng nhập thành công!',
            token,
            user: { user_id: user.user_id, user_name: user.user_name, email: user.email }
        });
    });
});

// API: Cập nhật thông tin người dùng (yêu cầu đăng nhập)
app.put('/api/user', authenticateToken, async (req, res) => {
    const { user_name, email, password } = req.body;
    const user_id = req.user.user_id; // Lấy user_id từ token

    try {
        // Kiểm tra email hoặc user_name mới có bị trùng không
        db.query(
            'SELECT * FROM users WHERE (email = ? OR user_name = ?) AND user_id != ?',
            [email, user_name, user_id],
            async (err, result) => {
                if (err) {
                    console.log('Lỗi kiểm tra email/user_name:', err);
                    return res.status(500).json({ error: err.message });
                }
                if (result.length > 0) {
                    const existingUser = result[0];
                    if (existingUser.email === email) {
                        return res.status(400).json({ error: 'Email đã được sử dụng' });
                    }
                    if (existingUser.user_name === user_name) {
                        return res.status(400).json({ error: 'Tên người dùng đã được sử dụng' });
                    }
                }

                // Nếu có mật khẩu mới, mã hóa mật khẩu
                let hashedPassword = null;
                if (password) {
                    const saltRounds = 10;
                    hashedPassword = await bcrypt.hash(password, saltRounds);
                }

                // Cập nhật thông tin người dùng
                const updateFields = [];
                const updateValues = [];

                if (user_name) {
                    updateFields.push('user_name = ?');
                    updateValues.push(user_name);
                }
                if (email) {
                    updateFields.push('email = ?');
                    updateValues.push(email);
                }
                if (hashedPassword) {
                    updateFields.push('password = ?');
                    updateValues.push(hashedPassword);
                }

                if (updateFields.length === 0) {
                    return res.status(400).json({ error: 'Không có thông tin nào để cập nhật' });
                }

                updateValues.push(user_id);
                const query = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;

                db.query(query, updateValues, (err, result) => {
                    if (err) {
                        console.log('Lỗi khi cập nhật user:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    // Cập nhật thông tin user trong token
                    const updatedUser = { user_id, user_name: user_name || req.user.user_name, email: email || req.user.email };
                    const newToken = jwt.sign(updatedUser, 'your_secret_key', { expiresIn: '1h' });
                    res.json({
                        message: 'Cập nhật thông tin thành công!',
                        token: newToken,
                        user: updatedUser
                    });
                });
            }
        );
    } catch (err) {
        console.log('Lỗi server:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});
// API: Lấy danh sách anime
app.get('/api/movies', (req, res) => {
    const query = `
        SELECT 
            movie_id as id,
            title,
            image_url,
            status
        FROM movies
        WHERE status = 'approved'`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// API: Lấy chi tiết phim kèm danh sách tập
app.get('/api/movies/:id', (req, res) => {
    const movieId = req.params.id;

    const movieQuery = `
    SELECT 
        movie_id AS id,
        title,
        description,
        image_url,
        status
    FROM movies
    WHERE movie_id = ? AND status = 'approved'
    `;

    const episodeQuery = `
        SELECT 
            episode_id,
            movie_id,
            episode_number AS episode,
            title,
            video_url
        FROM episodes
        WHERE movie_id = ?
        ORDER BY episode ASC
    `;

    db.query(movieQuery, [movieId], (err, movieResult) => {
        if (err) return res.status(500).json({ error: err.message });
        if (movieResult.length === 0) return res.status(404).json({ error: "Không tìm thấy phim" });

        const movie = movieResult[0];

        db.query(episodeQuery, [movieId], (err, episodeResults) => {
            if (err) return res.status(500).json({ error: err.message });

            movie.episodes = Array.isArray(episodeResults) ? episodeResults : [];
            res.json(movie);
        });
    });
});


// API: Gửi đánh giá (yêu cầu đăng nhập)
app.post('/api/reviews', authenticateToken, (req, res) => {
    const { movie_id, rating, comment } = req.body;
    const user_id = req.user.user_id; // Lấy user_id từ token

    if (!movie_id || !rating || !comment) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin (điểm đánh giá và bình luận)' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Điểm đánh giá phải từ 1 đến 5' });
    }

    db.query(
        'INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)',
        [user_id, movie_id, rating, comment],
        (err, result) => {
            if (err) {
                console.log('Lỗi khi gửi đánh giá:', err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Đánh giá thành công!' });
        }
    );
});

// API: Lấy danh sách đánh giá của một phim
app.get('/api/reviews/:movie_id', (req, res) => {
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
});



// Khởi động server
app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});