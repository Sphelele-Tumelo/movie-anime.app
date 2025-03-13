import { use, useEffect, useState } from "react";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";
import { getTopMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

function App() {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);

//Waits for  the user to stop typing for 500ms 
  useDebounce(() => {
    setDebouncedSearch(search);
  }, 5000, [search]);

//API Call
  const fetchMovies = async ( query = '') => {

    setLoading(false);
    setErrorMessage('');
    try {
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Error fetching data');
      }
      const data = await response.json();
      
      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Error fetching data');
        setMovies([]);
        return;
      } 

      setMovies(data.results);

       if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
       }
    } catch (error) {
      console.error(error);
      setErrorMessage(<Spinner /> ? 'Check Your Internet Connection!' : 'Error Fetching Data Try again later');
    } finally {
      setLoading(false);
    }
  };

 const fetchTrendingMovies = async () => {  
    try {
      const getResponse = await getTopMovies();

      setTrendingMovies(getResponse);

    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
    fetchMovies(debouncedSearch);
    
  }, [debouncedSearch]);

  useEffect(() => {
     fetchTrendingMovies();
  }, []);


  function handleSearch(event) {
    setSearch(event.target.value);
   
  }

  return (
    <>
      <main>
        <div className="pattern" />

        <div className="wrapper">
          <header>
            
            <img src="./src/assets/hero.png " alt="Hero Banner" />
            <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <div className="search">
            <div>
              <img src="./src/assets/search.svg" alt="search-svg"  onClick={ (movie) =>{
                <li key={movie.id}>
                <MovieCard movie={movie} key={movie.id} />
                </li>
              
              }} />
              <input type="text" onChange={handleSearch} placeholder="Search For Your Favourite Movie" /> <br />
            </div>
          </div>
          </header>
     
        
         
   

          <section className="all-movies">
            <h2>All movies</h2>
             {loading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movies.map((movie) => (
                  <li key={movie.id}>
                    <MovieCard movie={movie} key={movie.id} />
                  </li>
                  
                ))}
              </ul>
            )}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
