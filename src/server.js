// server.js
const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');
const morgan = require('morgan');

const app = express();
app.use(cors());
// 用于处理 JSON 格式的请求体
app.use(express.json());
// 用于解析 urlencoded 数据（如果需要）
app.use(express.urlencoded({ extended: true }));

// 静态资源：上传后的文件
app.use('/uploads', express.static('uploads'));

// 日志中间件
app.use(morgan('dev'));

// 确保 uploads 目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 数据库连接
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'QiQi1213@',
  database: 'project_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 文件上传配置（与之前类似）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // 解码文件名并拼接时间戳，确保唯一性
    const decodedFilename = iconv.decode(Buffer.from(file.originalname, 'binary'), 'utf8');
    cb(null, Date.now() + path.extname(decodedFilename));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 20 } // 限制20MB
});

// 上传接口：仅处理文件上传，返回文件 URL
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // 对原始文件名进行解码（可选）
  const decodedFilename = iconv.decode(Buffer.from(req.file.originalname, 'binary'), 'utf8');
  const fileUrl = `/uploads/${req.file.filename}`;
  // 返回数据结构需与前端 avue-form 的 propsHttp 配置对应
  res.json({ data: { url: fileUrl, name: decodedFilename } });
});

// 项目提交接口：不再处理文件，而是接收包含附件 URL 的 JSON 数据
app.post('/api/projects', (req, res) => {
  const { body } = req;
  // 假设附件信息保存在 pdfUrl 字段中，
  // pdfUrl 可能为对象数组（例如：[ { name, url }, ... ]），存入数据库时只存 URL
  let pdfUrls = [];
  if (body.pdfUrl) {
    pdfUrls = Array.isArray(body.pdfUrl) ? body.pdfUrl : [body.pdfUrl];
  }
  const sql = 'INSERT INTO projects SET ?';
  const values = {
    ...body,
    // 将附件 URL 数组转换为 JSON 字符串进行存储
    pdf_urls: JSON.stringify(pdfUrls.map(item => (item.url || item))),
    start_time: new Date(body.start_time),
    end_time: new Date(body.end_time)
  };
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ id: result.insertId });
  });
});

// 其他接口（如项目查询等）保持不变
app.get('/api/projects', (req, res) => {
  const { projectName, province, city, area } = req.query;
  let sql = `SELECT id, project_name, province, city, area, start_time FROM projects WHERE 1=1`;
  const params = [];
  if (projectName) {
    sql += ` AND project_name LIKE ?`;
    params.push(`%${projectName}%`);
  }
  if (province) {
    sql += ` AND province = ?`;
    params.push(province);
  }
  if (city) {
    sql += ` AND city = ?`;
    params.push(city);
  }
  if (area) {
    sql += ` AND area = ?`;
    params.push(area);
  }
  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

app.get('/api/projects/:id', (req, res) => {
  const sql = `SELECT * FROM projects WHERE id = ?`;
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(results[0]);
  });
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
