import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import '../styles/SearchResults.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResults() {
  const query = useQuery();
  const keyword = query.get("keyword");
  const [currentPage, setCurrentPage]= useState(1);
  const moviesPerPage= 10;
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (keyword) {
      axios
        .get(`http://localhost:3001/api/movies/search?q=${encodeURIComponent(keyword.trim())}`)
        .then((res) => setResults(res.data))
        .catch((err) => console.error("Lỗi tìm kiếm:", err));
    }
  }, [keyword]);
  // Tính tổng số trang
  const totalPages= Math.ceil(results.length/moviesPerPage);
  // Tính danh sách phim hiện thị theo trang 
  const indexOfLastMovie= currentPage * moviesPerPage;
  const indexOfFirstMovie= indexOfLastMovie - moviesPerPage;
  const currentMovies= results.slice(indexOfFirstMovie, indexOfLastMovie);

  const handlePageChange= (pageNumber) =>{
      setCurrentPage(pageNumber);
  }
  return (

    // Thay class "search-results" bằng "search-results-container"
    <div className="search-results-container">
      {/* Thêm div với class "search-title" bao quanh tiêu đề */}
      <div className="search-title">
        <h2>Kết quả tìm kiếm cho: "{keyword}"</h2>
      </div>

      {results.length > 0 ? (
        // Thay ul bằng ul với class "movie-list"
        <ul className="movie-list-search">
          {currentMovies.map((movie) => (
            <li key={movie.id} className="movie-card-search">
              <a href={`/movieDetail/${movie.id}`}>
                <img src={movie.image_url} alt={movie.title} />
                <div className="movie-title">{movie.title}</div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không tìm thấy kết quả.</p>
      )}
      <div className="more">
          <ul>
              {Array.from({length: totalPages}, (_, index) =>(
                  <li key={index}>
                      <button className={`page-button ${currentPage === index +1 ? 'active' :''}`} 
                          onClick={()=> handlePageChange(index+1)}
                          >
                          {index+1}
                      </button>
                  </li>
              ))}
          </ul>
      </div>
    </div>
  );
}


export default SearchResults;
