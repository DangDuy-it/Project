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
            release_year,
            genre,
            duration,
            image_url,
            background_url,
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
        status,
        TRIM(genre) AS genre,
        release_year AS release_year,
        duration,
        description,
        background_url

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
        movieData.background_url = movieData.background_url ? movieData.background_url.replace(/\s+/g, '') : '';

        res.status(200).json(movieData);
    });
};
// API: Cập nhật thông tin phim (cập nhật cả thể loại)
const updateMovie = (req, res) => {
    const movieId = req.params.movie_id;
    const {
        title,
        genre,
        release_year,
        duration,
        status,
        description,
        image_url,
        background_url
    } = req.body;

    const updateMovieSql = `
        UPDATE movies
        SET    
            title=?, 
            genre=?,         
            release_year=?,
            duration=?,
            status=?,
            description=?,
            image_url=?,
            background_url=?
        WHERE movie_id=?
    `;

    db.query(updateMovieSql, [title, genre, release_year, duration, status, description, image_url, background_url, movieId], (err, result) => {
        if (err) {
            console.error('Lỗi cập nhật phim:', err);
            return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật phim', error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim để cập nhật' });
        }

        // Bước 2: Xóa các thể loại cũ
        const deleteOldCategoriesSql = `DELETE FROM movie_categories WHERE movie_id = ?`;
        db.query(deleteOldCategoriesSql, [movieId], (errDelete) => {
            if (errDelete) {
                console.error('Lỗi khi xóa thể loại cũ:', errDelete);
                return res.status(500).json({ message: 'Lỗi khi xóa liên kết thể loại cũ', error: errDelete.message });
            }

            // Bước 3: Xử lý lại genre mới
            const genreNames = genre.split(',').map(name => name.trim()).filter(name => name !== '');
            if (genreNames.length === 0) {
                return res.status(200).json({ message: 'Cập nhật phim thành công (không có thể loại để cập nhật).' });
            }

            // Bước 4: Tìm category_id tương ứng
            const findCategoriesSql = `
                SELECT category_id FROM categories WHERE category_name IN (?)
            `;
            db.query(findCategoriesSql, [genreNames], (errFind, categories) => {
                if (errFind) {
                    console.error('Lỗi khi tìm category_id:', errFind);
                    return res.status(500).json({ message: 'Lỗi khi tìm category_id', error: errFind.message });
                }

                if (categories.length === 0) {
                    return res.status(200).json({ message: 'Cập nhật phim thành công nhưng không tìm thấy thể loại tương ứng.' });
                }

                // Bước 5: Chèn mới vào bảng movie_categories
                const movieCategoriesValues = categories.map(row => [movieId, row.category_id]);
                const insertMovieCategoriesSql = `
                    INSERT INTO movie_categories (movie_id, category_id) VALUES ?
                `;
                db.query(insertMovieCategoriesSql, [movieCategoriesValues], (errInsert) => {
                    if (errInsert) {
                        console.error('Lỗi khi thêm thể loại mới:', errInsert);
                        return res.status(500).json({ message: 'Cập nhật phim thành công nhưng lỗi khi thêm thể loại mới', error: errInsert.message });
                    }

                    // Thành công hoàn toàn
                    res.status(200).json({ message: `Cập nhật phim và ${categories.length} thể loại thành công.` });
                });
            });
        });
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
// API: Thêm một bộ phim
const addMovie = (req, res) => {
    const {
        title,
        description,
        release_year, 
        image_url,
        genre,
        duration,
        status: statusFromRequest, // Lấy giá trị status từ request body
        background_url 
    } = req.body;

    // >>> Xử lý giá trị mặc định cho status trước khi dùng trong validation/query <<<
    const finalStatus = statusFromRequest || 'Pending';

    // Basic validation
    if (!title || !description || !release_year || !duration || !image_url || !genre || !finalStatus || !background_url) {
        console.warn('Yêu cầu thêm phim thiếu thông tin bắt buộc:', req.body);
        return res.status(400).json({ error: 'Thiếu thông tin phim bắt buộc (title, description, year, duration, image_url, genre, status).' });
    }
    const sql = `
        INSERT INTO movies (title, description, release_year, duration, image_url, genre, status, background_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Chuẩn bị mảng các giá trị để thay thế cho dấu ?
    const values = [
        title,
        description,
        release_year,
        duration,
        image_url,
        genre,
        finalStatus, 
        background_url 
    ];

    // 1. Thêm phim vào bảng movies
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Lỗi khi thực hiện truy vấn INSERT:', err);
            // Gửi phản hồi lỗi server
            return res.status(500).json({ error: 'Đã xảy ra lỗi server khi thêm phim.' });
        }
        if (result.affectedRows === 1) {
            const newMovieId= result.insertId; // Lấy movie_id vừa tạo

            // 2.Xử lý chuỗi genre và tìm cateogory_id
            // Tách chuỗi genre bằng dấu phẩy, loại bỏ khoảng trắng thừa 
            const genreNames= genre.split(',').map(name=>  name.trim()).filter(name => name!= '');

            if (genreNames.length===0){
                res.status(201).json({
                    message: 'Thêm phim thành công ( Không có thể loại nào được liên kết )',
                    movie_id: newMovieId
                });
            }
            // Chuẩn bị truy vấn để tìm category_id cho tên các thể loại 
            const findCategoriesSql = ` SELECT 
                                            category_id 
                                        FROM categories 
                                        WHERE category_name IN (?)`;
            db.query(findCategoriesSql, [genreNames], (errCategories, resultCategories) => {
                if (errCategories){
                    console.error('Lỗi khi tìm category_id: ', errCategories);
                    return res.status(201).json({
                        message: 'Thêm phim thành công, nhưng gặp lỗi khi liên kết thể loại',
                        movie_id: newMovieId,
                        category_error: errCategories.message 
                    });
                }
                if ( resultCategories.length===0){
                    console.warn(`Không tìm thấy category_id cho các thể loại: ${genreNames.json(',')}`);

                    return res.status(201).json({
                        message: 'Thêm phim thành công, nhưng không tìm thấy thể loại nào tương ứng để liên kết',
                        movie_id: newMovieId,
                    });
                }
                // 3. Chuẩn bị và thêm dữ liêu vào bảng movie_categories
                const movieCategoriesValues = resultCategories.map(row=> [newMovieId, row.category_id]);

                const insertMovieCategoriesSql=`INSERT INTO movie_categories (
                                                        movie_id, 
                                                        category_id)
                                                VALUES ?
                                                `;
                db.query(insertMovieCategoriesSql, [movieCategoriesValues],(errMovieCategories, resultMovieCategories)=>{
                    if (errMovieCategories){
                        console.error('Lỗi khi thêm dữ liệu vào bảng movie_categories:' , errMovieCategories);

                        return res.status(201).json({
                            message: 'Thêm phim thành công, nhưng gặp lỗi khi thêm vào bảng liên kết thể loại.',
                            movie_id: newMovieId,
                            link_error: errMovieCategories.message
                        });
                    }
                    // Kiểm tra số lượng bản ghi đã được thêm vào movie_categories
                    if (resultMovieCategories.affectedRows > 0) {
                        // 4. Hoàn thành: Gửi phản hồi thành công thêm phim và liên kết thể loại
                        res.status(201).json({
                            message: `Thêm phim thành công và liên kết với ${resultMovieCategories.affectedRows} thể loại.`,
                            movie_id: newMovieId
                        });
                    } else{
                        // Trường hợp không có lỗi nhưng không có dòng nào được thêm vào movie_categories
                        console.warn('Không có dữ liệu nào được thêm vào movie_categories');
                        res.status(201).json({
                            message: 'Thêm phim thành công, nhưng không thêm được dữ liệu vào bảng movie_categories',
                            movie_id: newMovieId
                        });
                    }
                });
            });
        } else {
             console.error('Thêm phim thất bại: affectedRows không bằng 1.', result);
             res.status(500).json({ error: 'Thêm phim thất bại, không có hàng nào được thêm vào cơ sở dữ liệu.' });
        }
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
// API: Tìm kiếm phim theo tiêu đề hoặc thể loại
const searchMovies = (req, res) => {
    const keyword = req.query.q;
    if (!keyword) {
        return res.status(400).json({ error: 'Vui lòng nhập từ khóa tìm kiếm.' });
    }

    const likeKeyword = `%${keyword}%`;
    const sql = `
        SELECT 
            movie_id AS id,
            title,
            image_url,
            genre,
            description,
            status
        FROM movies
        WHERE (title LIKE ? OR genre LIKE ?) AND status = 'Approved'
        ORDER BY movie_id DESC
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

    const sql=`SELECT 
                    m.movie_id,
                    m.title,
                    m.image_url,
                    m.genre,
                    m.description,
                    m.duration,
                    m.release_year,
                    m.status,
                    COUNT(e.episode_id) AS episodes
                FROM movies m
                LEFT JOIN episodes e ON m.movie_id = e.movie_id
                WHERE m.title LIKE ? 
                GROUP BY m.movie_id
                ORDER BY m.movie_id DESC`;
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
    searchMoviesForAdmin
};

