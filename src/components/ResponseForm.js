import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BugResponsePage = () => {
  const { report_id } = useParams();
  const [bug, setBug] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchBug = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/bugs");
        const found = res.data.find(b => b.report_id === parseInt(report_id));
        setBug(found);
      } catch (err) {
        console.error("Lỗi tải báo lỗi", err);
      }
    };
    fetchBug();
  }, [report_id]);

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:3001/api/bugs/response", {
        report_id: report_id,
        response_text: responseText,
        technician_id: 1001 // Tạm gán cứng, sau có thể lấy theo login
      });
      setSuccessMsg("Phản hồi thành công!");
    } catch (err) {
      console.error("Lỗi gửi phản hồi", err);
    }
  };

  if (!bug) return <div>Đang tải...</div>;

  return (
    <div className="response-page">
      <h2>Phản hồi báo lỗi #{bug.report_id}</h2>
      <p><strong>Tài khoản:</strong> User ID {bug.user_id}</p>
      <p><strong>Tiêu đề:</strong> {bug.title}</p>
      <p><strong>Mô tả:</strong> {bug.description}</p>

      <textarea
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
        placeholder="Nhập phản hồi của bạn"
        rows={5}
      ></textarea>
      <br />
      <button onClick={handleSubmit}>Gửi phản hồi</button>
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
    </div>
  );
};

export default BugResponsePage;
