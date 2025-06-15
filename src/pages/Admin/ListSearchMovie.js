import '../../styles/Home.css';
import SearchMovie from '../../components/SearchMovie';

function Home(){
    return(
        <div>
            <div className="content">
            <SearchMovie></SearchMovie>
            </div>
        </div>
    );
};
export default Home;