
import '../../styles/Home.css'; 
import Notification from '../../components/Notification';
import Profile from '../../components/Profile';


function TheLoai(){
    return(
        <div>
            <div className="content">
                <Notification />
                <Profile />
            </div>
        </div>
    );
}

export default TheLoai;