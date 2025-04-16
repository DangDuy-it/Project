import React from 'react';
import '../../styles/Home.css'; 
import AdminList from '../../components/Admin/AdminList';


function DuyetPhim(){
    return(
        <div>
            <div className="content">
                <AdminList />
            </div>
        </div>
    );
}

export default DuyetPhim;
