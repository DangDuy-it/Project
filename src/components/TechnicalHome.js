import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/TechnicalHome.css";
import { Link } from "react-router-dom";



const TechnicalHome = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const fetchBugReports = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/bugs");
      const reportsWithEmails = await Promise.all(
        res.data.map(async (report) => {
          try {
            const userRes = await axios.get(`http://localhost:3001/api/users/${report.user_id}`);
            return {
              ...report,
              userEmail: userRes.data.email || `User ID: ${report.user_id}`,
              statusDisplay: report.status === 'pending' ? 'Chưa phản hồi' : (report.status === 'resolved' ? 'Đã phản hồi' : report.status),
              statusClass: report.status === 'resolved' ? 'da-phan-hoi' : 'chua-phan-hoi',
            };
          } catch (userError) {
            console.error(`Lỗi khi tải thông tin người dùng cho ID ${report.user_id}:`, userError);
            return {
              ...report,
              userEmail: `User ID: ${report.user_id}`,
              statusDisplay: report.status === 'pending' ? 'Chưa phản hồi' : (report.status === 'resolved' ? 'Đã phản hồi' : report.status),
              statusClass: report.status === 'resolved' ? 'da-phan-hoi' : 'chua-phan-hoi',
            };
          }
        })
      );
      setReports(reportsWithEmails);
    } catch (error) {
      console.error('Lỗi khi tải danh sách lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugReports();
  }, []);

  if (loading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="table-section-container">
      <div className="team-title">
        <h1>TEAM KỸ THUẬT!</h1>
      </div>
      <div className="table-header">
        <h2>Danh sách nhận báo lỗi!</h2>
      </div>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Account</th>
            <th>Thời gian</th>
            <th>Tình trạng</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reports.map((row, index) => (
            <tr key={row.report_id}>
              <td className="align-center">{index + 1}</td>
              <td className="align-center">{row.userEmail}</td>
              <td className="align-center">{formatDate(row.created_at)}</td>
              <td className={`align-center ${row.statusClass}`}>{row.statusDisplay}</td>
              <td className="align-center">
                <Link to={`/technical/response/${row.report_id}`}>
                  <button className="view-button-styled">Xem báo lỗi</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TechnicalHome;