import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Cho phép Frontend (chạy ở cổng 5173) gọi API mà không bị chặn lỗi CORS
app.use(cors());

app.get('/api/metrics', (req, res) => {
    const logFilePath = path.resolve(__dirname, '../logs/ai_metrics.jsonl');

    if (!fs.existsSync(logFilePath)) {
        return res.json([]); // Nếu chưa có file log, trả về mảng rỗng
    }

    try {
        // Đọc toàn bộ file text
        const fileContent = fs.readFileSync(logFilePath, 'utf-8');

        // Tách thành từng dòng, bỏ qua các dòng trống, và parse JSON
        const metrics = fileContent
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => JSON.parse(line));

        res.json(metrics);
    } catch (error) {
        console.error("Lỗi khi đọc file log:", error);
        res.status(500).json({ error: "Không thể đọc dữ liệu giám sát" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Observability API đang chạy tại http://localhost:${PORT}`);
    console.log(`   Dữ liệu Metrics có sẵn tại http://localhost:${PORT}/api/metrics`);
});