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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(morgan('dev'));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'QiQi1213@',
    database: 'project_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const decodedFilename = iconv.decode(Buffer.from(file.originalname, 'binary'), 'utf8');
        const sanitizedFilename = decodedFilename.replace(/\s/g, '');
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, -3); // 精确到秒的时间戳
        const newFilename = `${timestamp}-${sanitizedFilename}`;
        cb(null, newFilename);
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

    const decodedFilename = iconv.decode(Buffer.from(req.file.originalname, 'binary'), 'utf8');
    const sanitizedFilename = decodedFilename.replace(/\s/g, '');
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, -3); // 精确到秒的时间戳
    const newFilename = `${timestamp}-${sanitizedFilename}`;
    const fileUrl = `/uploads/${newFilename}`;

    res.json({ data: { url: fileUrl, name: newFilename } });
});

// 删除文件接口
app.delete('/api/upload/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  const fullUrl = `/uploads/${filename}`;
  if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
          if (err) {
              console.error('Error deleting file:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
          }
          // 同时从数据库中删除记录
          const deleteSql = 'DELETE FROM file_info WHERE full_url =?';
          pool.query(deleteSql, [fullUrl], (deleteErr, deleteResult) => {
              if (deleteErr) {
                  console.error('Database delete error:', deleteErr);
                  return res.status(500).json({ error: 'Internal Server Error' });
              }
              res.json({ message: 'File deleted successfully' });
          });
      });
  } else {
      res.status(404).json({ error: 'File not found' });
  }
});


// 项目提交接口：不再处理文件，而是接收包含附件 URL 的 JSON 数据
app.post('/api/projects', upload.any(), (req, res) => {
  const { body } = req;
  let pdfUrl = [];
  if (body.pdfUrl) {
    try {
        pdfUrl = JSON.parse(body.pdfUrl); // 只有在是有效的 JSON 字符串时才解析
    } catch (error) {
        // 如果已经是字符串，直接当做数组来处理
        pdfUrl = [body.pdfUrl];
    }
    console.log(pdfUrl);
  }
  const startDate = body.startDate;
  const endDate = body.endDate;

  // 过滤不必要的字段
  const filteredBody = {
    projectType: body.$projectType,
    projectName: body.projectName,
    constructionUnit: body.constructionUnit,
    compilationUnit: body.compilationUnit,
    province: body.$province,
    city: body.$city,
    area: body.$area,
    description: body.description,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    pdfUrl: JSON.stringify(pdfUrl) // 将 URL 数组转换为 JSON 字符串
  };

  const sql = 'INSERT INTO projects SET?';
  pool.query(sql, filteredBody, (err, result) => {
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
    let sql = 'SELECT id, projectType, projectName, province, city, area, startDate, endDate FROM projects WHERE 1 = 1';
    const params = [];
    if (projectName) {
        sql += ' AND project_name LIKE?';
        params.push(`%${projectName}%`);
    }
    if (province) {
        sql += ' AND province =?';
        params.push(province);
    }
    if (city) {
        sql += ' AND city =?';
        params.push(city);
    }
    if (area) {
        sql += ' AND area =?';
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
    const sql = 'SELECT * FROM projects WHERE id =?';
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