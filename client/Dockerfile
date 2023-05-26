# Sử dụng hình ảnh chứa Node.js và npm
FROM node:16-alpine as builder

# Thiết lập thư mục làm việc trong container
WORKDIR /app/web

# Sao chép file package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Sao chép mã nguồn ứng dụng vào thư mục làm việc
COPY . .

# Build ứng dụng Angular
RUN npm run build

# Sử dụng hình ảnh Nginx để triển khai ứng dụng Angular đã được build
FROM nginx:alpine

# Sao chép tệp cấu hình Nginx của ứng dụng
COPY nginx.conf /etc/nginx/nginx.conf

# Sao chép các tệp đã được build từ giai đoạn trước vào thư mục nginx/html
COPY --from=builder /app/web/dist/ /usr/share/nginx/html

# Mở cổng 80 để có thể truy cập ứng dụng
EXPOSE 80

# CMD sẽ được thực thi tự động khi container được khởi chạy
CMD ["nginx", "-g", "daemon off;"]
