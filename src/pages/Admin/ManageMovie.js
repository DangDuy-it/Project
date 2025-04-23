import '../../styles/Home.css';
import MovieList from '../../components/ListMovie';

function Home(){
    return(
        <div>
            <div className="content">
            <MovieList></MovieList>
            </div>
        </div>
    );
};
export default Home;