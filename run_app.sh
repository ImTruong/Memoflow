#!/bin/bash

# 1. Tự động lấy địa chỉ IP LAN nội bộ của máy Host (hỗ trợ macOS, Linux, WSL)
LOCAL_IP=$(node -e "const nets = require('os').networkInterfaces(); console.log(Object.values(nets).flat().find(net => net.family === 'IPv4' && !net.internal).address)" 2>/dev/null)

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Không tìm thấy địa chỉ IP mạng nội bộ. Mặc định dùng localhost."
    LOCAL_IP="127.0.0.1"
else
    echo "✅ Đã tìm thấy địa chỉ IP máy chủ: $LOCAL_IP"
fi

# 2. Tạo / Cập nhật file .env cho Mobile app để nạp biến môi trường động
echo "EXPO_PUBLIC_API_URL=http://$LOCAL_IP:8080" > FrontEnd/memoflow/.env
echo "📝 Đã cập nhật FrontEnd/memoflow/.env thành: EXPO_PUBLIC_API_URL=http://$LOCAL_IP:8080"

# 3. Khởi chạy Docker Compose (DB, Backend, Admin Web)
echo "🚀 Đang khởi động các dịch vụ Docker (Database, Backend, Admin Web)..."
docker compose up -d

# 4. Di chuyển vào thư mục Mobile app và khởi động Expo CLI
echo "📱 Đang chuẩn bị chạy ứng dụng Mobile (Expo Go)..."
cd FrontEnd/memoflow

# Kiểm tra nếu chưa cài node_modules thì tự cài
if [ ! -d "node_modules" ]; then
    echo "📦 Chưa phát hiện node_modules trong FrontEnd/memoflow. Tiến hành cài đặt dependencies..."
    npm install
fi

echo "✨ Khởi chạy Expo Server. Hãy dùng ứng dụng Expo Go quét mã QR hiển thị dưới đây:"
npx expo start
