# Stock Traders Realtime Dashboard

## Giới Thiệu

Ứng dụng Stock Traders Realtime Dashboard là một hệ thống dashboard hiển thị dữ liệu chứng khoán theo thời gian thực. Ứng dụng sử dụng Node.js, Kafka, và MongoDB để thu thập, xử lý và hiển thị dữ liệu chứng khoán.

## Kiến Trúc

- **Node.js**: Được sử dụng để phát triển các API backend.
- **Kafka**: Được sử dụng để quản lý và xử lý dữ liệu
- **MongoDB**: Được sử dụng để lưu trữ dữ liệu
- **Docker**: Được sử dụng để đóng gói ứng dụng vào một image, sau đó sử dụng image đó để tạo và chạy nhiều container.

## Các Thành Phần

1. **Stock Data Service**: Dịch vụ thu thập và xử lý dữ liệu chứng khoán từ nguồn cung cấp.
2. **Database Service**: Dịch vụ lưu trữ dữ liệu chứng khoán vào MongoDB.
3. **Notification Service**: Dịch vụ thông báo và gửi thông tin đến người dùng.
4. **Kafka Producer**: Sản xuất dữ liệu chứng khoán lên Kafka.
5. **Kafka Consumer**: Tiêu thụ dữ liệu từ Kafka và lưu vào MongoDB.

## Cài Đặt và Triển Khai

### 1. Cài Đặt Docker và Docker Compose

Trên Ubuntu:

```bash
sudo apt update
sudo apt install docker.io docker-compose
Clone Repository

```

### 2. Cấu Hình Dự Án

#### Clone Repository

```bash
git clone https://github.com/NDHUY782/StockTraders-BETest.git

cd StockTraders-BETest
```

#### Xây Dựng Docker Images

```bash
docker-compose build
```

#### Khởi Chạy Dự Án

```bash
docker-compose up
```

### 3. Truy Cập Dự Án

Sử dụng thư viện Swagger để thực hiện các thao tác

**1.** Truy cập http://localhost:3001/api-docs ==> Để xem thông tin chứng khoán thời gian thực

**2.** Truy cập http://localhost:3002/api-docs/ ==> Để thực hiện các thao tác CRUD cơ bản

**3.** Truy cập http://localhost:3003/api-docs/==> Để truy cập và thực hiện gửi thông báo thời gian thực cho client

### Hoặc

### Truy Cập Dashboard Bằng Cách:

- Sau khi ứng dụng đã được khởi động, bạn có thể truy cập vào dashboard qua địa chỉ IP đưuọc deploy trên AWS EC2

**http://3.107.86.47:3001/api-docs**

**http://3.107.86.47:3002/api-docs**

**http://3.107.86.47:3003/api-docs**
