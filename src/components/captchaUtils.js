const { createCanvas, loadImage } = require('canvas');

function generateCaptcha() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captchaText = '';
    for (let i = 0; i < 4; i++) {
        captchaText += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const width = 120;
    const height = 40;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 设置背景色
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // 绘制干扰线
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.strokeStyle = getRandomColor();
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // 绘制噪点
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = getRandomColor();
        ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }

    // 绘制验证码文本
    ctx.font = '30px Arial';
    ctx.fillStyle = '#333';
    for (let i = 0; i < captchaText.length; i++) {
        const x = 20 + i * 20 + Math.random() * 10;
        const y = 30 + Math.random() * 10;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.random() - 0.5) * 0.2);
        ctx.fillText(captchaText[i], 0, 0);
        ctx.restore();
    }

    const captchaDataUrl = canvas.toDataURL();
    return { captchaText, captchaDataUrl };
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

module.exports = { generateCaptcha };