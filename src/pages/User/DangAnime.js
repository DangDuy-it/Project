import React from 'react';
import '../../styles/Home.css'; 
import Notification from '../../components/Notification';
import List from '../../components/List';


function DangAnime(){
    return(
        <div>
            <div className="content">
                <Notification />
                <List />
            </div>
        </div>
    );
}

export default DangAnime;
