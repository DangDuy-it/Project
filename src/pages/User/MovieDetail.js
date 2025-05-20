import React from 'react';
import '../../styles/Home.css'; 
import Notification from '../../components/Notification';
import MovieDetail from '../../components/MovieDetail';


function TheLoai(){
    return(
        <div>
            <div className="content">
                <Notification />
                <MovieDetail />
            </div>
        </div>
    );
}

export default TheLoai;