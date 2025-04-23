import React from 'react';
import '../../styles/Home.css'; 
import Notification from '../../components/Notification';
import List from '../../components/List';


function TheLoai(){
    return(
        <div>
            <div className="content">
                <Notification />
                <List />
            </div>
        </div>
    );
}

export default TheLoai;