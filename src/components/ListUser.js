import {useEffect,useState} from 'react';
import '../styles/ListUser.css';
import {Link} from 'react-router-dom';

function ListUser() {
  const [users, setUsers] = useState([]);
    // Gọi API khi component mount
    useEffect(() => {
      fetch('http://localhost:3001/api/users') // backend server của bạn
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((err) => console.error('Lỗi lấy danh sách user:', err));
    }, []);
  return (
    <div className="list-users">
      <div className="list-user-tag">
        <li>Quản lý tài khoản</li>
      </div>
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
    </div>
  );
}
export default ListUser;

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
