const db = require('../config/db');

// API: Lấy danh sách anime cho người dùng ( chỉ approved )
const getMovies = (req, res) => {
    const query = `
        SELECT 
            m.movie_id AS id,
            m.title,
            m.image_url,
            m.status,
            GROUP_CONCAT(DISTINCT c.category_name) AS genres
        FROM movies m
        LEFT JOIN movie_categories mc ON m.movie_id = mc.movie_id
        LEFT JOIN categories c ON mc.category_id = c.category_id
        WHERE m.status = 'Approved'
        GROUP BY m.movie_id
        ORDER BY m.movie_id DESC  
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
                m.movie_id,
                m.title,
                m.description,
                m.release_year,
                m.view_count,
                GROUP_CONCAT(DISTINCT c.category_name) AS genres,
                m.duration,
                m.image_url,
                m.background_url,
                m.status,
                (SELECT AVG(r.rating) FROM reviews r WHERE r.movie_id=m.movie_id) AS avg_rating,
                (SELECT COUNT(r.review_id) FROM reviews r WHERE r.movie_id=m.movie_id) AS total_reviews
            FROM movies m
            LEFT JOIN movie_categories mc ON m.movie_id = mc.movie_id
            LEFT JOIN categories c ON mc.category_id = c.category_id
            WHERE m.movie_id = ? AND m.status = 'Approved'
            GROUP BY m.movie_id
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

        // Format avg_rating nếu có
        if (movie.avg_rating !== null) {
            movie.avg_rating = parseFloat(movie.avg_rating).toFixed(1);
        }else{
            movie.avg_rating="10"
        }
        
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
            GROUP_CONCAT(DISTINCT c.category_name) AS genres,
            m.description,
            m.release_year AS year,
            m.duration,
            COUNT(DISTINCT e.episode_id) AS episodes
        FROM movies m
        LEFT JOIN movie_categories mc ON m.movie_id = mc.movie_id
        LEFT JOIN categories c ON mc.category_id = c.category_id
        LEFT JOIN episodes e ON m.movie_id = e.movie_id
        GROUP BY m.movie_id 
        ORDER BY m.movie_id DESC
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
            m.movie_id,
            m.title,
            m.image_url,
            m.status,
            GROUP_CONCAT(DISTINCT c.category_name) AS genres,
            m.release_year,
            m.duration,
            m.description,
            m.background_url,
            COUNT(e.episode_id) AS episodes_count
        FROM movies m
        LEFT JOIN movie_categories mc ON m.movie_id = mc.movie_id
        LEFT JOIN categories c ON mc.category_id = c.category_id
        LEFT JOIN episodes e ON m.movie_id = e.movie_id
        WHERE m.movie_id = ?
        GROUP BY m.movie_id
    `;

    db.query(query, [movieId], (err, result) => {
        if(err) {
            console.error('Lỗi lấy chi tiết movie: ', err);
            return res.status(500).json({message: 'Lỗi máy chủ', error: err.message});
        }
        if(result.length === 0) {
            return res.status(404).json({message: 'Không tìm thấy movie'});
        }
        const movieData = result[0];
        movieData.image_url = movieData.image_url ? movieData.image_url.trim() : '';
        movieData.background_url = movieData.background_url ? movieData.background_url.trim() : '';

        movieData.genre = movieData.genres
            ? movieData.genres.split(',').map(g => g.trim())
            : [];

        delete movieData.genres; 
        res.status(200).json(movieData);
    });
};
// API: Cập nhật thông tin phim (cập nhật cả thể loại)
const updateMovie = (req, res) => {
    const movieId = req.params.movie_id;
    const {
        title,
        genre, // dạng chuỗi: "Hành động, Phiêu lưu"
        release_year,
        duration,
        status,
        description,
        existing_image_url,
        existing_background_url
    } = req.body;

    const image_url = req.files?.image?.[0]?.filename
        ? `/images/${req.files.image[0].filename}`
        : existing_image_url;

    const background_url = req.files?.background?.[0]?.filename
        ? `/images/${req.files.background[0].filename}`
        : existing_background_url;

    const genreNames = genre?.split(",").map(g => g.trim()).filter(Boolean) || [];

    if (genreNames.length === 0) {
        return res.status(400).json({ message: "Phim phải có ít nhất một thể loại." });
    } 

    if (status==="Approved"){
        const episodeCheckSql= `SELECT COUNT(*) AS episode_count 
                                    FROM episodes
                                    WHERE movie_id=?
                                `;
        db.query(episodeCheckSql,[movieId],(epErr, epRes)=>{
            if(epErr){
                console.error("Lỗi kiểm tra tập phim:", epErr);
                return res.status(500).json({message: "Lỗi khi kiểm tra tập phim", error: epErr.message});

            }
            const episodeCount= epRes[0]?.episode_count;
            if (episodeCount===0){
                return res.status(400).json({message:"Phim phải có ít nhất một tập phim"});

            }
            proceddUpdate();
        });
    }else{
        proceddUpdate();
    }
           
    // Hàm xử lý cập nhật phim và thể loại
    function proceddUpdate(){
        const updateMovieSql = `
            UPDATE movies
            SET title=?, release_year=?, duration=?, status=?, description=?, image_url=?, background_url=?
            WHERE movie_id=?
        `;
    
        db.query(updateMovieSql,[title, release_year, duration, status, description, image_url, background_url, movieId],(err) => {
                if (err) {
                    console.error("Lỗi cập nhật phim:", err);
                    return res.status(500).json({ message: "Lỗi khi cập nhật phim", error: err.message });
                }
    
                // Xóa các thể loại cũ
                db.query(`DELETE FROM movie_categories WHERE movie_id = ?`, [movieId], (delErr) => {
                    if (delErr) {
                        console.error("Lỗi xóa thể loại cũ:", delErr);
                        return res.status(500).json({ message: "Lỗi khi xóa thể loại", error: delErr.message });
                    }
    
                    // Tìm category_id từ tên
                    db.query(`SELECT category_id FROM categories WHERE category_name IN (?)`, [genreNames], (findErr, categories) => {
                        if (findErr) {
                            console.error("Lỗi tìm thể loại:", findErr);
                            return res.status(500).json({ message: "Lỗi khi tìm category", error: findErr.message });
                        }
    
                        if (categories.length === 0) {
                            return res.status(400).json({ message: "Không tìm thấy thể loại hợp lệ." });
                        }
    
                        const insertValues = categories.map(c => [movieId, c.category_id]);
                        db.query(`INSERT INTO movie_categories (movie_id, category_id) VALUES ?`, [insertValues], (insertErr) => {
                            if (insertErr) {
                                console.error("Lỗi khi thêm thể loại:", insertErr);
                                return res.status(500).json({ message: "Lỗi khi thêm thể loại", error: insertErr.message });
                            }
    
                            res.status(200).json({ message: `Cập nhật phim và ${insertValues.length} thể loại thành công.` });
                        });
                    });
                });
            }
        );
    }
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
// API: thêm phim
const addMovie = (req, res) => {
    const {
        title,
        description,
        release_year, 
        genre, // đây vẫn là chuỗi tên thể loại từ client
        duration,
        status: statusFromRequest, 
    } = req.body;

    const finalStatus = statusFromRequest || 'Pending';

    // Kiểm tra cơ bản
    if (!title || !description || !release_year || !duration || !genre || !finalStatus) {
        return res.status(400).json({ error: 'Thiếu thông tin phim bắt buộc.' });
    }

    // Kiểm tra ảnh
    const imageFile = req.files?.image?.[0];
    const backgroundFile = req.files?.background?.[0];
    if (!imageFile || !backgroundFile) {
        return res.status(400).json({ error: 'Thiếu ảnh phim hoặc ảnh nền.' });
    }

    // Tách và làm sạch thể loại
    const genreNames = genre.split(',').map(name => name.trim()).filter(name => name !== '');
    if (genreNames.length === 0) {
        return res.status(400).json({ error: 'Không có thể loại hợp lệ.' });
    }

    // Kiểm tra thể loại tồn tại
    const findCategoriesSql = `
        SELECT category_id, category_name 
        FROM categories 
        WHERE category_name IN (?)
    `;
    db.query(findCategoriesSql, [genreNames], (errCategories, resultCategories) => {
        if (errCategories) {
            console.error('Lỗi khi kiểm tra thể loại:', errCategories);
            return res.status(500).json({ error: 'Lỗi khi kiểm tra thể loại.' });
        }

        const foundNames = resultCategories.map(row => row.category_name);
        const missingGenres = genreNames.filter(name => !foundNames.includes(name));
        if (missingGenres.length > 0) {
            return res.status(400).json({
                error: `Các thể loại không tồn tại: ${missingGenres.join(', ')}`
            });
        }

        // Tất cả thể loại hợp lệ → tiếp tục thêm phim
        const image_url = `/images/${imageFile.filename}`;
        const background_url = `/images/${backgroundFile.filename}`;
        const insertMovieSql = `
            INSERT INTO movies (title, description, release_year, duration, image_url, status, background_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const movieValues = [
            title, description, release_year, duration,
            image_url, finalStatus, background_url
        ];

        db.query(insertMovieSql, movieValues, (errInsert, resultInsert) => {
            if (errInsert) {
                console.error('Lỗi khi thêm phim:', errInsert);
                return res.status(500).json({ error: 'Lỗi khi thêm phim.' });
            }

            const newMovieId = resultInsert.insertId;
            const movieCategoriesValues = resultCategories.map(row => [newMovieId, row.category_id]);
            const insertLinkSql = `INSERT INTO movie_categories (movie_id, category_id) VALUES ?`;

            db.query(insertLinkSql, [movieCategoriesValues], (errLink, resultLink) => {
                if (errLink) {
                    console.error('Lỗi khi thêm movie_categories:', errLink);
                    return res.status(201).json({
                        message: 'Thêm phim thành công nhưng lỗi khi liên kết thể loại.',
                        movie_id: newMovieId,
                        link_error: errLink.message
                    });
                }

                res.status(201).json({
                    message: `Thêm phim thành công và liên kết với ${resultLink.affectedRows} thể loại.`,
                    movie_id: newMovieId
                });
            });
        });
    });
};



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
            m.movie_id,
            m.title,
            m.background_url,
            GROUP_CONCAT(DISTINCT c.category_name) AS genres,
            m.description
        FROM movies m
        LEFT JOIN movie_categories mc ON m.movie_id = mc.movie_id
        LEFT JOIN categories c ON mc.category_id = c.category_id
        WHERE m.status = 'Approved' 
        GROUP BY m.movie_id
        ORDER BY m.view_count DESC 
        LIMIT 3
    `;
    db.query(query,(err,result)=>{
        if(err){
            console.error("Lỗi lấy phim cho slide:", err);
            return res.status(500).json({error: "Lỗi máy chủ"});

        }
        res.status(200).json(result);
    })
}
// API: Tìm kiếm phim theo tiêu đề hoặc thể loại
const searchMovies = (req, res) => {
    const keyword = req.query.q;
    if (!keyword) {
        return res.status(400).json({ error: 'Vui lòng nhập từ khóa tìm kiếm.' });
    }

    const likeKeyword = `%${keyword}%`;
    const sql = `
        SELECT 
            m.movie_id AS id,
            m.title,
            m.image_url,
            GROUP_CONCAT(DISTINCT c.category_name) AS genres,
            m.description,
            m.status
        FROM movies m
        LEFT JOIN movie_categories mc ON m.movie_id = mc.movie_id
        LEFT JOIN categories c ON mc.category_id = c.category_id
        WHERE (m.title LIKE ? OR c.category_name LIKE ?) AND m.status = 'Approved'
        GROUP BY m.movie_id
        ORDER BY m.movie_id DESC
    `;

    db.query(sql, [likeKeyword, likeKeyword], (err, results) => {
        if (err) {
            console.error('Lỗi tìm kiếm phim:', err);
            return res.status(500).json({ error: 'Lỗi máy chủ khi tìm kiếm phim' });
        }
        res.status(200).json(results);
    });
};
const searchMoviesForAdmin= (req, res) =>{
    const searchTerm=req.query.movieName;

    if (!searchTerm){
        return res.status(500).json({message:"Vui lòng nhập từ khóa tìm kiếm"});
    }

    const sql=`
        SELECT 
            m.movie_id,
            m.title,
            m.image_url,
            GROUP_CONCAT(DISTINCT c.category_name) AS genres,
            m.description,
            m.duration,
            m.release_year,
            m.status,
            COUNT(DISTINCT e.episode_id) AS episodes
        FROM movies m
        LEFT JOIN movie_categories mc ON m.movie_id = mc.movie_id
        LEFT JOIN categories c ON mc.category_id = c.category_id
        LEFT JOIN episodes e ON m.movie_id = e.movie_id
        WHERE m.title LIKE ?
        GROUP BY m.movie_id
        ORDER BY m.movie_id DESC
    `;
    const searchPattern= `%${searchTerm}%`;
    db.query(sql, [searchPattern],(err, results)=>{
        if (err){
            console.error("",err);
            return res.status(500).json({message:"Lỗi máy chủ."});
        }
        if (results.length===0){
            return res.status(404).json({message:"Không tìm thấy phim phù hợp."});
        }
        res.status(200).json(results);
    });
}
const viewCount = (req, res) => {
    const movieId = req.params.movie_id;

    const sql = `UPDATE movies SET view_count = view_count + 1 WHERE movie_id = ?`;
    db.query(sql, [movieId], (err) => {
        if (err) {
            console.error("Lỗi tăng view count:", err.message);
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }
        res.status(200).json({ message: "Đã tăng lượt xem" });
    });
};




module.exports = {
    getMovies,
    getMovieDetails,
    getMoviesAdmin,
    getMovieById,
    updateMovie,
    addEpisode,
    addMovie,
    deleteMovie,
    getSliderMovie,
    searchMovies,
    searchMoviesForAdmin,
    viewCount
};