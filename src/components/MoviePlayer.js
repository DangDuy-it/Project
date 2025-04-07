import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimeList } from './Datalist';
import '../styles/MoviePlayer.css';

const MoviePlayer = () => {
    const { id } = useParams();
    const movie = AnimeList.find((m) => m.id === parseInt(id));

    const [currentEpisode, setCurrentEpisode] = useState(movie?.episodes?.[0] || null);

    // Kiểm tra movie sau khi gọi useState
    if (!movie) {
        return <div>Phim không tồn tại!</div>;
    }

    // Dữ liệu giả lập cho bình luận
    const comments = [
        { user: "User1", comment: "Phim hay quá!" },
        { user: "User2", comment: "Tập này cảm động thật sự." },
    ];

    const country = "Trung Quốc";

    return (
        <div className="movie-player-container">
            <div className="breadcrumb">
                <Link to="/">Trang chủ</Link> / <span>{country}</span> / <span>{movie.title}</span> / <span>{currentEpisode.title}</span>
            </div>

            <div className="video-player">
                <iframe
                    width="100%"
                    height="400"
                    src={currentEpisode.videoUrl}
                    title={movie.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>

            <div className="episode-list">
                <h3>DANH SÁCH TẬP</h3>
                <div className="episodes">
                    {movie.episodes.map((ep) => (
                        <button
                            key={ep.episode}
                            className={ep.episode === currentEpisode.episode ? "active" : ""}
                            onClick={() => setCurrentEpisode(ep)}
                        >
                            {ep.episode}
                        </button>
                    ))}
                </div>
            </div>

            <div className="movie-info">
                <img src={movie.image} alt={movie.title} className="movie-poster" />
                <div className="movie-details">
                    <h3>GIA THIÊN</h3>
                    <p>
                        Già Thiên kể về Diệp Phàm, một chàng trai ở thế giới hiện tại vô tình bị hút vào chiếc quan tài được kéo bởi chín con rồng, được đưa đến một thế giới cổ đại, một thế giới tiên hiệp rộng lớn, kỳ dị và đầy bí ẩn. Hành trình của Diệp Phàm chông gai, và đầy nguy hiểm rình rập, luôn luôn cận kề cái chết, nhưng với sự kiên trì và nghị lực, Diệp Phàm ngày càng nâng cao thực lực bản thân, bước vào con đường tu tiên gian khổ.
                    </p>
                </div>
            </div>

            <div className="comment-section">
                <h3>BÌNH LUẬN</h3>
                <div className="comments">
                    {comments.map((comment, index) => (
                        <div key={index} className="comment">
                            <strong>{comment.user}:</strong> {comment.comment}
                        </div>
                    ))}
                </div>
                <textarea placeholder="Viết bình luận của bạn..."></textarea>
                <button className="comment-button">GỬI</button>
            </div>
        </div>
    );
};

export default MoviePlayer;