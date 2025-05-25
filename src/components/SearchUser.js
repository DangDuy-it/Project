import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/ListUser.css';

// Hook tùy chỉnh để lấy query parameters từ URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchUser() {
    const query = useQuery();
    const userName = query.get('userName');
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hàm lấy kết quả tìm kiếm người dùng từ API
    useEffect(() => {
        if (!userName) {
            setUsers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        axios
            .get(`http://localhost:3001/api/users/search?userName=${encodeURIComponent(userName.trim())}`)
            .then((response) => {
                setUsers(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi khi tìm kiếm người dùng:", err);
                setUsers([]);
                setLoading(false);
            });
    }, [userName]);

    if (loading) {
        return <div>Đang tải kết quả tìm kiếm...</div>;
    }

    return (
        <div className="list-users">
            <div className="list-user-tag">
                <li>Kết quả tìm kiếm cho: "{userName || ''}"</li>
            </div>
            {users.length > 0 ? (
                <>
                    {/* Header row */}
                    <div className="user-item header">
                        <div className="name"><li>Tên</li></div>
                        <div className="email"><li>Email</li></div>
                        <div className="role"><li>Role</li></div>
                        <div className="status"><li>Trạng thái</li></div>
                    </div>
                    {/* User list */}
                    <div className="list-user">
                        {users.map((user) => (
                            <Link
                                to={`/admin/user/${user.user_id}`}
                                key={user.user_id}
                                className='nav-link'
                            >
                                <ListItem
                                    userName={user.user_name}
                                    email={user.email}
                                    role={user.role_id === 1 ? 'Admin' : 'User'}
                                    status={user.status}
                                />
                            </Link>
                        ))}
                    </div>
                </>
            ) : (
                <p>Không tìm thấy tài khoản người dùng.</p>
            )}
        </div>
    );
}

function ListItem({ userName, email, role, status }) {
    const statusClass = status === 'Active' ? 'status active' : 'status banned';

    return (
        <div className="user-item">
            <div className="name"><li>{userName}</li></div>
            <div className="email"><li>{email}</li></div>
            <div className="role"><li>{role}</li></div>
            <div className={statusClass}><li>{status}</li></div>
        </div>
    );
}

export default SearchUser;