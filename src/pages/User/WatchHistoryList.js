import React from 'react';
import '../../styles/Home.css'; 
import Notification from '../../components/Notification';
import WatchHistory from '../../components/WatchHistory';

function WatchHistoryList() {
    return (
        <div>
            <div className="content">
                <Notification />
                <WatchHistory />
            </div>
        </div>
    );
}

export default WatchHistoryList;