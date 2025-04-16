const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3001;

// Cho phép React gọi API
app.use(cors());
app.use(express.json());
app.use('/images', express.static('public/images'));
app.use('/video', express.static('public/video'));

// Kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'web'
});

db.connect((err) => {
    if (err) {
        console.log("Lỗi kết nối:", err);
    } else {
        console.log("Đã kết nối MySQL!");
    }
});

// API: Lấy danh sách users
app.get('/users', (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// API: Lấy danh sách anime
app.get('/api/movies', (req, res) => {
    const query = `
        SELECT 
            movie_id AS id,
            title,
            description,
            image_url,
            release_year as year,
            duration,
            genre,
            status
        FROM movies
        WHERE status = 'approved'`; // Chỉ lấy phim đã được duyệt
    
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
        release_year as year,
        duration,
        genre,
        status
    FROM movies
    WHERE movie_id = ? AND status = 'approved'
`   ;

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

// Khởi động server
app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});
