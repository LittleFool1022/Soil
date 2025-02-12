const fs = require('fs');
const path = require('path');

// 上传文件目录
const uploadDir = path.join(__dirname, 'uploads');

// 读取目录中的所有文件
fs.readdir(uploadDir, (err, files) => {
    if (err) {
        console.error('Error reading upload directory:', err);
        return;
    }

    // 遍历每个文件并删除
    files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error(`Error deleting file ${file}:`, unlinkErr);
            } else {
                console.log(`File ${file} deleted successfully.`);
            }
        });
    });
});