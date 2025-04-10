import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        // Nếu không có token, chuyển hướng về trang đăng nhập
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;