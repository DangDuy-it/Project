import React from 'react';
import '../../styles/Home.css'; 
import Notification from '../../components/Notification';
import CategoryMovies from '../../components/CategoryMovies';


function TheLoai(){
    return(
        <div>
            <div className="content">
                <Notification />
                <CategoryMovies />
            </div>
        </div>
    );
}

export default TheLoai;