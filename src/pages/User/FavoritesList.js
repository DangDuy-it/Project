import React from 'react';
import '../../styles/Home.css'; 
import Notification from '../../components/Notification';
import Favoties from '../../components/Favorites';


function TheLoai(){
    return(
        <div>
            <div className="content">
                <Notification />
                <Favoties />
            </div>
        </div>
    );
}

export default TheLoai;