import {Routes,Route,useLocation,} from "react-router-dom";
import Header from "./components/Header";
import HeaderAdmin from "./components/HeaderAdmin";
import DangAnime from "./pages/User/DangAnime";
import Home from "./pages/User/Home";
import Login from "./pages/User/Login";
import Register from "./pages/User/Register";
import MoviePlayer from "./components/MoviePlayer";
import Profile from "./pages/User/Profile";
import ManageUser from "./pages/Admin/ManageUser";
import ManageMovie from "./pages/Admin/ManageMovie";
import UserInfor from "./components/UserDetail";
import EditMovie from "./components/EditMovie";
import SearchResults from "./pages/User/PageSearch";
import CategoryMovies from "./pages/User/TheLoai";
import AddMovie from "./components/AddMovie";
import Favorites from "./pages/User/FavoritesList";
import MovieDetail from "./pages/User/MovieDetail";
import WatchHistoryList from "./pages/User/WatchHistoryList";
import ListSearchUser from "./pages/Admin/ListSearchUser";
import ListSearchMovie from "./pages/Admin/ListSearchMovie";
import EpisodesContent from './pages/Admin/EpisodesContent';
import Forgot from "./pages/User/Forgot";

export default function Layout() {
    const location = useLocation();
    const isAdminRoute =
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/manage");
  
    return (
      <>
        {isAdminRoute ? <HeaderAdmin /> : <Header />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dang-anime" element={<DangAnime />} />
          <Route path="/the-loai/:name" element={<CategoryMovies />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movie/:id/episode/:episodeNumber" element={<MoviePlayer />} />
          <Route path="/movies/search" element={<SearchResults />} />
          <Route path="/movies/favorites" element={<Favorites/>}/>
          <Route path="/movieDetail/:id" element={<MovieDetail/>}/>
          <Route path="/movies/watch-history" element={<WatchHistoryList />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="/profile" element={<Profile />}/>
          <Route path="/manageuser" element={<ManageUser />} />
          <Route path="/managemovie" element={<ManageMovie />} />
          <Route path="/admin/user/:userId" element={<UserInfor />} />
          <Route path="/admin/edit/:movieId" element={<EditMovie />} />
          <Route path="/admin/search-users" element={<ListSearchUser />} />
          <Route path="/admin/search-movies" element={<ListSearchMovie />} />
          <Route path="/admin/episodes/:movie_id" element={<EpisodesContent />} />
          <Route path="/admin/add" element={<AddMovie/>} />
        </Routes>
      </>
    );
  }
  