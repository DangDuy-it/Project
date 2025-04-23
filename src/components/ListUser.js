import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ListUser = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:3001/api/users')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setUsers(res.data);
                    setError(null);
                } else {
                    setUsers([]);
                    setError('Dữ liệu trả về không đúng định dạng');
                }
            })
            .catch(err => {
                console.error("Lỗi khi lấy danh sách người dùng:", err);
                setUsers([]);
                setError('Không thể tải danh sách người dùng');
            });
    }, []);

    return (
        <div>
            <h2>Danh sách người dùng</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {users.length === 0 && !error ? (
                <p>Không có người dùng nào</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(users) && users.map(user => (
                            <tr key={user.user_id}>
                                <td>{user.user_id}</td>
                                <td>{user.user_name}</td>
                                <td>{user.email}</td>
                                <td>{user.role_id === 1 ? "Admin" : "User"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ListUser;