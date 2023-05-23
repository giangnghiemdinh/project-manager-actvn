# Sử dụng hình ảnh chứa Node.js và npm
FROM node:16-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app/service

# Sao chép package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn ứng dụng vào thư mục làm việc
COPY . .

# Build ứng dụng NestJS
RUN npm run build

# Mở cổng 3000 để có thể truy cập ứng dụng
EXPOSE 3000

# Chạy ứng dụng khi container được khởi chạy
CMD ["npm", "run", "start:prod"]
