const db = require('../config/db');

// API: Lấy danh sách anime cho người dùng ( chỉ approved )
const getMovies = (req, res) => {
    const query = `
        SELECT 
            movie_id as id,
            title,
            image_url,
            status
        FROM movies
        WHERE status = 'Approved'
        ORDER BY movie_id DESC    
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};
// API: Lấy chi tiết phim kèm danh sách tập
const getMovieDetails = (req, res) => {
    const movieId = req.params.id;

    const movieQuery = `
        SELECT 
            movie_id AS id,
            title,
            description,
            image_url,
            status
        FROM movies
        WHERE movie_id = ? AND status = 'Approved'
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
};
// API: Lấy danh sách cho quản trị viên ( approved or pending)
const getMoviesAdmin = (req, res) => {
    const query = `
        SELECT 
            m.movie_id,
            m.title,
            m.image_url,
            m.status,
            m.genre,
            m.release_year AS year,
            m.duration,
            COUNT(e.episode_id) AS episodes
        FROM movies m
        LEFT JOIN episodes e ON m.movie_id = e.movie_id
        GROUP BY m.movie_id
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// API: Lấy thông tin phim theo ID
const getMovieById = (req, res) => {
    const movieId = req.params.movie_id;
    const query = `
    SELECT
        movie_id,
        title,
        TRIM(image_url) AS image_url,
        TRIM(video_url) AS video_url,
        status,
        TRIM(genre) AS genre,
        release_year AS release_year,
        duration,
        description
    FROM movies 
    WHERE movie_id = ?
    `;

    db.query(query, [movieId], (err, result) => {
        if(err) {
            console.error('Lỗi lấy chi tiết movie: ', err);
            return res.status(500).json({message: 'Lỗi máy chủ',error:err.message});
        }
        if(result.length === 0) {
            return res.status(404).json({message: 'Không tìm thấy movie'});
        }
        const movieData = result[0];
        movieData.image_url = movieData.image_url ? movieData.image_url.replace(/\s+/g, '') : '';
        movieData.video_url = movieData.video_url ? movieData.video_url.replace(/\s+/g, '') : '';

        res.status(200).json(movieData);
    });
};
// API: Cập nhật thông tin phim
const updateMovie= (req, res) => {
    const movieId= req.params.movie_id;
    const{
        title,
        genre,
        release_year,
        duration,
        status,
        description,
        image_url
    }= req.body;

    const query=`
        UPDATE movies
            SET    
                title=?, 
                genre=?,         
                release_year=?,
                duration=?,
                status=?,
                description=?,
                image_url=? 
        WHERE movie_id=?
    `;
    db.query(query, [title, genre,release_year, duration,status,description,image_url,movieId ],(err,result)=>{
        if (err) {
            console.error('Lỗi cập nhật phim:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật phim', error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim để cập nhật' });
        }

        res.status(200).json({ message: 'Cập nhật phim thành công' });
    });
};
// API: Thêm tập phim cho bộ phim
const addEpisode = (req, res) => {
    const { movieId } = req.params;
    const { episode_number, title, video_url } = req.body;

    if (!episode_number || !title || !video_url) {
        return res.status(400).json({ error: 'Thiếu thông tin tập phim.' });
    }

    const sql = 'INSERT INTO episodes (movie_id, episode_number, title, video_url) VALUES (?, ?, ?, ?)';
    db.query(sql, [movieId, episode_number, title, video_url], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Tập phim đã được thêm thành công' });
    });
}
// API: Xóa một bộ phim
const deleteMovie = (req, res) => {
    const movieId = req.params.movie_id; // Lấy ID phim từ params của URL

    // Kiểm tra xem movieId có tồn tại và hợp lệ không (tùy chọn, nhưng nên có)
    if (!movieId) {
        return res.status(400).json({ message: 'Thiếu ID phim cần xóa.' });
    }

    // Câu lệnh SQL để xóa phim
    const sql = 'DELETE FROM movies WHERE movie_id = ?';

    // Thực thi câu lệnh SQL
    db.query(sql, [movieId], (err, result) => {
        if (err) {
            console.error('Lỗi khi xóa phim từ DB:', err);
            // Trả về lỗi server nếu có lỗi database
            return res.status(500).json({ message: 'Lỗi máy chủ khi xóa phim', error: err.message });
        }

        // Kiểm tra xem có dòng nào bị ảnh hưởng (tức là có phim được xóa) hay không
        if (result.affectedRows === 0) {
            // Nếu không có dòng nào bị ảnh hưởng, có nghĩa là không tìm thấy phim với ID đó
            return res.status(404).json({ message: 'Không tìm thấy phim để xóa' });
        }

        // Xóa thành công
        res.status(200).json({ message: 'Xóa phim thành công' });
    });
};

// API: Lấy danh sách phim hiện thị Slider
const getSliderMovie = (req, res) =>{
    const query=`
        SELECT
            movie_id,
            title,
            background_url,
            genre,
            description
        FROM movies
        WHERE status = 'Approved' -- Chỉ lấy phim đã duyệt
        ORDER BY movie_id DESC -- Sắp xếp theo ID phim giảm dần
        LIMIT 3 -- Giới hạn 3 phim cho slider
    `;
    db.query(query,(err,result)=>{
        if(err){
            console.error("Lỗi lấy phim cho slide:", err);
            return res.status(500).json({error: "Lỗi máy chủ"});

        }
        res.status(200).json(result);
    })
}


module.exports = {
    getMovies,
    getMovieDetails,
    getMoviesAdmin,
    getMovieById,
    updateMovie,
    addEpisode,
    deleteMovie,
    getSliderMovie
};