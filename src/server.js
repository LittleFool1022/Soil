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
// 修改：启用信任代理，解决 X-Forwarded-For 警告
app.set('trust proxy', true); 
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS axios.create
// 修改cors配置部分
const corsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? ['http://zgstbc.com']
        : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'];
  
      if (!origin) return callback(null, true); // 允许无origin请求
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('请求来源未被允许'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
  };
  
app.use(cors(corsOptions));
  

// 请求限流（防止暴力攻击）
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP限制100次请求
    keyGenerator: (req) => {
      // 手动指定获取客户端 IP 的方式
      return req.ip; 
    }
  });
app.use(limiter);

// 数据库连接池
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'QiQi1213@',
  database: process.env.DB_NAME || 'project_db',
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
app.post('/api/uploads', upload.single('file'), (req, res) => {
  try {
    if (!req.file) throw new Error('请选择上传文件');
    
    const baseUrl = req.protocol + '://' + req.get('host');
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    console.log('PDF上传后的完整数据库中的URL连接:', fileUrl); // 新增打印URL逻辑
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
  //console.log('收到项目提交请求，Body内容:', req.body); // 添加请求日志
  let connection;
  try {
    // 输入验证
    const requiredFields = [
      'projectType', 'projectName', 'constructionUnit',
      'compilationUnit', 'province', 'city', 'area',
      'startDate', 'endDate', 'description', 'pdfUrls'
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
    //console.log('解析后的文件列表:', files); // 添加日志
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
    if (req.body.pdfUrls) {
      try {
        const files = JSON.parse(req.body.pdfUrls);
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
    if (connection) {
        try {
            connection.release();
            //console.log('数据库连接已释放');
        } catch (releaseError) {
            console.error('数据库连接释放失败:', releaseError);
        }
    }
  }
});

// 文件删除接口
app.delete('/api/uploads/files', async (req, res) => {
    const fileUrl = req.query.url;
    if (!fileUrl) {
      return res.status(400).json({ error: '缺少文件 URL 参数' });
    }
  
    let connection;
    try {
      // 从 URL 中提取文件名
      const filename = path.basename(fileUrl);
      const filePath = path.join(__dirname, '../uploads', filename);

      //console.log('要删除的文件路径:', filePath); // 添加日志
  
      // 检查文件是否存在并删除
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
  
      // 从数据库中删除对应的记录
      connection = await pool.getConnection();
      await connection.execute('DELETE FROM project_files WHERE file_url =?', [fileUrl]);
  
      res.status(200).json({ message: '文件删除成功' });
    } catch (error) {
      console.error('文件删除错误:', error);
      res.status(500).json({ error: '文件删除失败：' + error.message });
    } finally {
      if (connection) connection.release();
    }
  });

// 项目查询接口
app.get('/api/projects', async (req, res) => {
    try {
        // 构建查询条件
        let query = 'SELECT * FROM projects WHERE 1=1';
        const params = [];

        // 处理查询参数
        if (req.query.projectType) {
            query += ' AND project_type = ?';
            params.push(req.query.projectType);
        }
        if (req.query.projectName) {
            query += ' AND project_name LIKE ?';
            params.push(`%${req.query.projectName}%`);
        }
        if (req.query.startDate && req.query.endDate) {
            query += ' AND start_date >= ? AND end_date <= ?';
            params.push(req.query.startDate, req.query.endDate);
        }
        if (req.query.province) {
            query += ' AND province = ?';
            params.push(req.query.province);
        }
        if (req.query.city) {
            query += ' AND city = ?';
            params.push(req.query.city);
        }
        if (req.query.area) {
            query += ' AND area = ?';
            params.push(req.query.area);
        }

        // 执行查询
        const [results] = await pool.query(query + ' ORDER BY create_time DESC', params);

        res.json(results);
    } catch (error) {
        console.error('查询错误:', error);
        res.status(400).json({ error: error.message });
    }
});

// 根据 ID 获取项目详情接口
app.get('/api/projects/:id', async (req, res) => {
  try {
      const projectId = req.params.id;
      //console.log('接收到的项目 ID:', projectId);
      // 查询项目基本信息
      const [projectRows] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
      if (projectRows.length === 0) {
          return res.status(404).json({ error: '项目未找到' });
      }
      const project = projectRows[0];

      // 查询项目附件信息
      const [fileRows] = await pool.query('SELECT file_name, file_url FROM project_files WHERE project_id = ?', [projectId]);
      project.pdfUrls = fileRows.map(file => ({ name: file.file_name, url: file.file_url }));

      res.json(project);
  } catch (error) {
      console.error('查询错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
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
