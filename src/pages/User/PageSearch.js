import React from 'react';
import '../../styles/Home.css'; 
import Notification from '../../components/Notification';
import SearchResults from '../../components/SearchResults';


function TheLoai(){
    return(
        <div>
            <div className="content">
                <Notification />
                <SearchResults />
            </div>
        </div>
    );
}

export default TheLoai;