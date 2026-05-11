# 🚀 AI Observability Dashboard

Một giải pháp giám sát hiệu suất và chi phí thời gian thực cho các ứng dụng tích hợp AI (Sử dụng Anthropic Claude SDK). Hệ thống cung cấp cái nhìn trực quan về độ trễ (latency), tiêu thụ token và chi phí vận hành thông qua giao diện Dashboard hiện đại.

![Dashboard Preview](https://img.shields.io/badge/UI-Premium_Dark_Mode-blueviolet)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_Vite_|_Express_|_Tailwind_4-blue)

## ✨ Tính năng nổi bật

- **📊 Visual Analytics:** Biểu đồ đường cho độ trễ và biểu đồ cột cho việc tiêu thụ Token (Input/Output).
- **💰 Cost Tracking:** Tính toán chi phí chính xác dựa trên model Claude Haiku (hoặc các model khác tùy chỉnh).
- **⚡ Real-time Sync:** Tự động đồng bộ và cập nhật dữ liệu mới mỗi 5 giây không cần tải lại trang.
- **💎 Premium Design:** Giao diện tối (Dark Mode) với phong cách Glassmorphism, tối ưu trải nghiệm người dùng.
- **🛠️ Agent Tracking:** Module Agent tích hợp sẵn trình ghi log tự động vào định dạng `.jsonl`.

## 🏗️ Cấu trúc dự án

```text
├── client/                # React Vite App (Frontend)
│   ├── src/App.tsx        # Dashboard logic & UI
│   └── src/index.css      # Tailwind CSS v4 Styles
├── server/                # Node.js Express (Backend)
│   ├── src/server.ts      # API Server cung cấp Metrics
│   ├── src/agent.ts       # AI Agent mô phỏng & ghi Log
│   └── logs/              # Nơi lưu trữ dữ liệu ai_metrics.jsonl
└── .env                   # Biến môi trường (Anthropic API Key)
```

## 🚀 Hướng dẫn cài đặt

### 1. Cấu hình môi trường
Tạo file `.env` ở thư mục gốc và thêm API Key của bạn:
```env
ANTHROPIC_API_KEY=your_api_key_here
```

### 2. Cài đặt Dependencies
Mở terminal và chạy lệnh sau ở cả hai thư mục `client` và `server`:
```bash
# Cài đặt cho Server
cd server
npm install

# Cài đặt cho Client
cd ../client
npm install
```

## 🛠️ Cách vận hành

Bạn cần chạy 3 tiến trình song song để hệ thống hoạt động đầy đủ:

### Bước 1: Chạy API Server (Backend)
```bash
cd server
npm run start
```
*Server sẽ chạy tại: http://localhost:3000*

### Bước 2: Chạy Dashboard (Frontend)
```bash
cd client
npm run dev
```
*Dashboard sẽ chạy tại: http://localhost:5173*

### Bước 3: Chạy Agent (Sinh dữ liệu mẫu)
Mỗi lần bạn chạy lệnh này, Agent sẽ thực hiện các câu hỏi AI và ghi log mới vào hệ thống. Dashboard sẽ tự động cập nhật dữ liệu này.
```bash
cd server
npm run agent
```

## 🧪 Công nghệ sử dụng

- **Frontend:** React 19, Vite, Recharts, Tailwind CSS v4.
- **Backend:** Express.js, TSX, Anthropic SDK.
- **Dữ liệu:** JSONL (JSON Lines) cho việc ghi log hiệu năng cao.

---
*By Hng2725*
