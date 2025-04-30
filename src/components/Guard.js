
import { Navigate, useLocation } from "react-router-dom";

export default function Guard({ children }) {
  const location = useLocation();
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return children;         // Chưa đăng nhập ⇒ cho qua

  const { role_id } = JSON.parse(storedUser);
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/manage");

  // Admin (role 1) mà đang vào route user ⇒ đẩy sang /manageuser
  if (Number(role_id) === 1 && !isAdminRoute) {
    return <Navigate to="/manageuser" replace />;
  }

  // User thường mà đang vào route admin ⇒ đẩy về /
  if (Number(role_id) !== 1 && isAdminRoute) {
    return <Navigate to="/" replace />;
  }

  return children; // Hợp lệ ⇒ render như bình thường
}
