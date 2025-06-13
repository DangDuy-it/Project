
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

  // Nếu là route công khai, bỏ qua kiểm tra và render children
  if (isPublicRoute) {
    return children;
  }

  const storedUser = localStorage.getItem("user");

  // Nếu chưa đăng nhập, chuyển hướng về "/login"
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  let role_id;
  try {
    const user = JSON.parse(storedUser);
    role_id = user.role_id;
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

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