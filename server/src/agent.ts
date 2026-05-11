import Anthropic from '@anthropic-ai/sdk';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load biến môi trường từ file .env ở thư mục gốc dự án
// __dirname = server/src/ → cần đi lên 2 cấp (../../) để đến project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Tạo thư mục logs nếu chưa có (server/logs/)
const logDirectory = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}
const logFilePath = path.join(logDirectory, 'ai_metrics.jsonl');

export async function askAgentWithTracking(prompt: string) {
    const startTime = performance.now();
    let status = 'success';
    let errorDetails = null;
    let inputTokens = 0;
    let outputTokens = 0;

    try {
        console.log(`[Agent] Đang xử lý: "${prompt}"...`);
        const response = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001", // Mặc định dùng Haiku theo thiết lập của bạn
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }]
        });

        // Lấy thông tin token từ response
        inputTokens = response.usage?.input_tokens || 0;
        outputTokens = response.usage?.output_tokens || 0;

        return response.content[0].type === 'text' ? response.content[0].text : 'Không có phản hồi text';

    } catch (error: any) {
        status = 'error';
        errorDetails = error.message;
        throw error;
    } finally {
        const endTime = performance.now();
        const latencyMs = Math.round(endTime - startTime);

        // Công thức tính tiền mô phỏng (Haiku: $0.25/1M input, $1.25/1M output)
        const cost = (inputTokens * 0.00000025) + (outputTokens * 0.00000125);

        const logEntry = {
            id: Date.now().toString(), // Tạo ID duy nhất bằng timestamp
            timestamp: new Date().toISOString(),
            prompt_length: prompt.length,
            status,
            latency_ms: latencyMs,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            total_tokens: inputTokens + outputTokens,
            cost_usd: cost,
            error: errorDetails
        };

        // Ghi log vào cuối file JSONL
        fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
        console.log(`[Log] Đã ghi nhận: Latency ${latencyMs}ms | Cost: $${cost.toFixed(6)}`);
    }
}

// Chạy thử để sinh ra vài dòng Log
async function runTest() {
    await askAgentWithTracking("Thủ đô của Việt Nam là gì? Trả lời ngắn gọn.");
    await askAgentWithTracking("Kể cho tôi một câu chuyện cười ngắn về lập trình viên.");
    await askAgentWithTracking("1 + 1 bằng mấy?");
}

// Nếu file này được chạy trực tiếp, nó sẽ thực thi hàm test
if (require.main === module) {
    runTest();
}