
import { Navigate, useLocation } from "react-router-dom";

export default function Guard({ children }) {
  const location = useLocation();

  // Các route công khai, không cần kiểm tra đăng nhập
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/dang-anime",
    "/movies/search",
  ];

  // Kiểm tra nếu route hiện tại là công khai
  const isPublicRoute =
    publicRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/the-loai/") ||
    location.pathname.startsWith("/movieDetail/") ||
    (location.pathname.startsWith("/movie/") && location.pathname.includes("/episode/"));

  const storedUser = localStorage.getItem("user");

  // Nếu đã đăng nhập, kiểm tra vai trò
  if (storedUser) {
    let role_id;
    try {
      const user = JSON.parse(storedUser);
      role_id = user.role_id;
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }

    // Admin (role_id === 1) không được truy cập route công khai
    if (Number(role_id) === 1 && isPublicRoute) {
      return <Navigate to="/manageuser" replace />;
    }

    const isAdminRoute =
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/manage");

    // Admin (role_id === 1) mà vào route user khác (không công khai) ⇒ đẩy sang /manageuser
    if (Number(role_id) === 1 && !isAdminRoute && !isPublicRoute) {
      return <Navigate to="/manageuser" replace />;
    }

    // User thường (role_id !== 1) mà vào route admin ⇒ đẩy về /
    if (Number(role_id) !== 1 && isAdminRoute) {
      return <Navigate to="/" replace />;
    }
  }

  // Nếu chưa đăng nhập và không phải route công khai, chuyển hướng về /login
  if (!storedUser && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  return children;
}