const { response } = require("express");
const db = require("../config/db");

// Lấy danh sách các lỗi
const getAllBugReports = (req, res) => {
  const sql = "SELECT * FROM bug_reports";
  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Lỗi truy vấn bug_reports" });
    res.json(result);
  });
};

// Gửi phản hồi đến lỗi
const responseToBug = (req, res) => {
  const { report_id, response_text, technician_id } = req.body;
  const sql =
    "INSERT INTO bug_responses (bug_id, response_text, technician_id) VALUES (?, ?, ?)";
  db.query(sql, [report_id, response_text, technician_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi khi gửi phản hồi" });
    res.json({ message: "Phản hồi đã được gửi thành công" });
  });
};

module.exports = {
  getAllBugReports,
  responseToBug,
};
