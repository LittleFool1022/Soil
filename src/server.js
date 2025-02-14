require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const helmet = require('helmet');
const morgan = require('morgan');
const { createPool } = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

// 安全中间件配置
// 新增信任代理配置（放在其他中间件之前）
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false); // 生产环境启用
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS 配置（生产环境需调整）
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://zgstbc.netlify.app'] 
    : 'http://localhost:8080',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // 如果需要跨域带cookie
}));

// 在路由前添加显式OPTIONS处理（可选保障）
app.options('*', (req, res) => {
  res.header('Access-Control-Max-Age', '86400') // 缓存24小时
  res.sendStatus(204)
})

// 请求限流（防止暴力攻击）
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个IP限制100次请求
});
app.use(limiter);

// 数据库连接池
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'water_conservation',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 文件上传配置
const uploadDir = path.join(__dirname, '../uploads'); // 建议放在项目根目录
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = decodeURIComponent(escape(file.originalname));
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(safeName)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('仅允许上传PDF文件（最大20MB）'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter
});

// 文件上传接口
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) throw new Error('请选择上传文件');
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      data: { 
        name: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
        url: fileUrl
      }
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(400).json({ error: error.message });
  }
});

// 项目提交接口
app.post('/api/projects', async (req, res) => {
  let connection;
  try {
    // 输入验证
    const requiredFields = [
      'projectType', 'projectName', 'constructionUnit',
      'compilationUnit', 'province', 'city', 'area',
      'startDate', 'endDate', 'description', 'pdfUrl'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `缺少必填字段：${missingFields.join(', ')}`
      });
    }

    // 数据库事务
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 插入项目数据
    const [project] = await connection.execute(
      `INSERT INTO projects (
        project_type, project_name, construction_unit,
        compilation_unit, province, city, area,
        start_date, end_date, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.projectType,
        req.body.projectName,
        req.body.constructionUnit,
        req.body.compilationUnit,
        req.body.province,
        req.body.city,
        req.body.area,
        req.body.startDate,
        req.body.endDate,
        req.body.description
      ]
    );

    // 处理文件关联
    const files = JSON.parse(req.body.pdfUrls);
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('至少需要上传一个附件');
    }

    for (const file of files) {
      await connection.execute(
        `INSERT INTO project_files 
        (project_id, file_name, file_url) 
        VALUES (?, ?, ?)`,
        [project.insertId, file.name, file.url]
      );
    }

    await connection.commit();
    res.status(201).json({ id: project.insertId });
  } catch (error) {
    // 错误处理
    if (connection) await connection.rollback();
    
    // 清理已上传文件（如果存在）
    if (req.body.pdfUrl) {
      try {
        const files = JSON.parse(req.body.pdfUrl);
        files.forEach(file => {
          const filePath = path.join(uploadDir, path.basename(file.url));
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      } catch (e) {
        console.error('文件清理失败:', e);
      }
    }

    console.error('项目提交错误:', error);
    const statusCode = error.message.includes('缺少') ? 400 : 500;
    res.status(statusCode).json({ 
      error: statusCode === 400 ? error.message : '服务器内部错误'
    });
  } finally {
    if (connection) connection.release();
  }
});

// 项目查询接口
app.get('/api/projects', async (req, res) => {
  try {
    // 参数验证
    const validParams = {
      projectType: ['A', 'B', 'C', 'D', 'E'],
      province: /^\d{6}$/,
      city: /^\d{6}$/,
      area: /^\d{6}$/
    };

    // 构建查询条件
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params = [];
    
    // 安全过滤查询参数
    ['projectType', 'projectName', 'province', 'city', 'area'].forEach(field => {
      if (req.query[field]) {
        // 特殊字段格式验证
        if (validParams[field] && !validParams[field].test(req.query[field])) {
          throw new Error(`参数 ${field} 格式无效`);
        }
        
        query += ` AND ${field} = ?`;
        params.push(req.query[field]);
      }
    });

    // 日期范围处理
    if (req.query.startDate && req.query.endDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.query.startDate) || 
          !/^\d{4}-\d{2}-\d{2}$/.test(req.query.endDate)) {
        throw new Error('日期格式应为YYYY-MM-DD');
      }
      query += ' AND start_date >= ? AND end_date <= ?';
      params.push(req.query.startDate, req.query.endDate);
    }

    // 执行查询
    const [results] = await pool.query(query + ' ORDER BY create_time DESC', params);
    
    // 敏感字段过滤
    const safeResults = results.map(item => ({
      id: item.id,
      project_name: item.project_name,
      project_type: item.project_type,
      province: item.province,
      city: item.city,
      area: item.area,
      start_date: item.start_date,
      end_date: item.end_date
    }));

    res.json(safeResults);
  } catch (error) {
    console.error('查询错误:', error);
    res.status(400).json({ error: error.message });
  }
});

// 修改为普通静态资源服务
app.use('/uploads', express.static(uploadDir));

// 统一错误处理
app.use((err, req, res, next) => {
  console.error('全局错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
