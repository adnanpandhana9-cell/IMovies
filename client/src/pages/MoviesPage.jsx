import React, { useState, useEffect, useCallback } from 'react';
import movieService from '../services/movieService';
import MovieCard from '../components/common/MovieCard';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const genres = ['Action', 'Adventure', 'Drama', 'Sci-Fi', 'Thriller', 'Crime', 'Biography'];
  const languages = ['English', 'Hindi', 'Spanish', 'French'];

  const fetchMovies = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await movieService.getMovies({
        page,
        limit: 8,
        search: searchTerm,
        genre: selectedGenre,
        language: selectedLanguage,
        status: selectedStatus,
      });

      setMovies(data.movies || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedGenre, selectedLanguage, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMovies]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('all');
    setSelectedLanguage('all');
    setSelectedStatus('all');
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="mb-4">
        <h1 className="fw-bold text-white mb-2">Explore Movies</h1>
        <p className="text-secondary">
          Discover currently showing blockbusters and upcoming theatrical premieres.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="im-card p-4 mb-4">
        <div className="row g-3 align-items-center">
          {/* Search Input */}
          <div className="col-lg-4 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                placeholder="Search by movie title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Genre Dropdown */}
          <div className="col-lg-3 col-md-6 col-sm-6">
            <select
              className="form-select bg-dark text-light border-secondary"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="all">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div className="col-lg-2 col-md-4 col-sm-6">
            <select
              className="form-select bg-dark text-light border-secondary"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="all">All Languages</option>
              {languages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="col-lg-2 col-md-4 col-sm-6">
            <select
              className="form-select bg-dark text-light border-secondary"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="NOW_SHOWING">Now Showing</option>
              <option value="COMING_SOON">Coming Soon</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="col-lg-1 col-md-4 col-sm-6 text-end">
            <button className="btn btn-outline-danger w-100" onClick={handleResetFilters} title="Reset filters">
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading movies...</span>
          </div>
          <p className="text-secondary mt-3">Fetching movies from MongoDB Atlas...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="im-card p-5 text-center my-4">
          <i className="bi bi-film display-3 text-secondary mb-3"></i>
          <h4 className="fw-bold text-white mb-2">No Movies Found</h4>
          <p className="text-secondary mb-4">
            No titles matched your current search and filter criteria.
          </p>
          <button className="btn im-btn-primary" onClick={handleResetFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3 text-secondary small">
            <span>Showing {movies.length} of {total} titles</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          <div className="row g-4 mb-5">
            {movies.map((movie) => (
              <div key={movie._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2">
              <button
                className="btn btn-outline-light btn-sm px-3"
                disabled={currentPage <= 1}
                onClick={() => fetchMovies(currentPage - 1)}
              >
                <i className="bi bi-chevron-left me-1"></i> Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  className={`btn btn-sm ${pg === currentPage ? 'im-btn-primary' : 'btn-outline-secondary text-light'}`}
                  onClick={() => fetchMovies(pg)}
                >
                  {pg}
                </button>
              ))}

              <button
                className="btn btn-outline-light btn-sm px-3"
                disabled={currentPage >= totalPages}
                onClick={() => fetchMovies(currentPage + 1)}
              >
                Next <i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MoviesPage;
