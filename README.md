# Website Quản lý Tuyển Dụng - TalentHub

Đây là dự án Website Quản lý Tuyển Dụng được phát triển cho Công ty Talent Hub, nhằm mục đích tối ưu hóa quy trình tuyển dụng, kết nối nhà tuyển dụng và ứng viên.

## Link Repository

- https://github.com/quanuiter/TalentHub.git

### Frontend
- **ReactJS:** Thư viện JavaScript để xây dựng giao diện người dùng.
- **React Router DOM:** Để quản lý điều hướng trang.
- **Axios:** Để thực hiện các lời gọi API đến backend.
- **Material-UI (MUI):** Bộ thư viện component UI.
- **Context API (useAuth):** Để quản lý trạng thái xác thực người dùng.

### Backend
- **Node.js:** Môi trường thực thi JavaScript phía máy chủ.
- **ExpressJS:** Framework để xây dựng API.
- **MongoDB:** Hệ quản trị cơ sở dữ liệu NoSQL.
- **Mongoose:** ODM (Object Data Modeling) để tương tác với MongoDB.
- **JSON Web Tokens (JWT):** Để xác thực người dùng.
- **Bcrypt.js:** Để mã hóa mật khẩu.
- **Multer:** Middleware để xử lý upload file (CV).
- **Dotenv:** Để quản lý các biến môi trường.

## Hướng dẫn cài đặt và chạy dự án

### Yêu cầu chung:
- **Node.js:** (Phiên bản >= 18.x khuyến nghị, dựa trên `engines` trong `package.json` của Vite và backend)
- **npm** hoặc **yarn**
- **MongoDB:** Cài đặt và chạy MongoDB server local hoặc sử dụng một dịch vụ MongoDB Atlas.

### Cài đặt Backend:

1.  **Di chuyển vào thư mục `backend`:**
    ```bash
    cd backend
    ```

2.  **Cài đặt các dependencies:**
    ```bash
    npm install
    # hoặc
    # yarn install
    ```

3.  **Thiết lập biến môi trường:**
    Tạo một file `.env` trong thư mục `backend` với nội dung sau (thay thế bằng thông tin của bạn):
    ```env
    PORT=5001
    MONGODB_URI=mongodb://localhost:27017/talenthub_db_dev 
    # Thay thế bằng chuỗi kết nối MongoDB của bạn
    # Ví dụ cho MongoDB Atlas: MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/talenthub_db?retryWrites=true&w=majority

    JWT_SECRET=yourVeryStrongJwtSecretKeyGoesHere 
    # Thay thế bằng một chuỗi bí mật mạnh mẽ và ngẫu nhiên
    ```
    *Lưu ý:* `MONGODB_URI` là chuỗi kết nối đến cơ sở dữ liệu MongoDB của bạn. `JWT_SECRET` là một chuỗi bí mật dùng để ký và xác thực token.

4.  **Chạy Backend server:**
    * Để chạy ở chế độ development (với nodemon tự động restart khi có thay đổi code):
        ```bash
        npm run dev
        ```
       
    * Để chạy ở chế độ production:
        ```bash
        npm start
        ```
       
    Backend sẽ chạy trên cổng được định nghĩa trong file `.env` (mặc định là 5001).

### Cài đặt Frontend:

1.  **Di chuyển vào thư mục gốc của dự án frontend** (nơi chứa file `package.json` của frontend - trong trường hợp này có thể là thư mục gốc của repo hoặc một thư mục con `frontend` nếu bạn cấu trúc như vậy. Dựa trên đường dẫn các file jsx, có vẻ thư mục `src` nằm ở gốc).
    ```bash
    # cd frontend (nếu bạn có thư mục riêng cho frontend)
    # Hoặc nếu src nằm ở gốc repo thì không cần cd
    ```

2.  **Cài đặt các dependencies:**
    ```bash
    npm install
    # hoặc
    # yarn install
    ```
   

3.  **Thiết lập biến môi trường (nếu cần):**
    Frontend của bạn sử dụng `VITE_API_BASE_URL` để kết nối đến backend.
    Tạo một file `.env` ở thư mục gốc của frontend (cùng cấp với `vite.config.js`) với nội dung:
    ```env
    VITE_API_BASE_URL=http://localhost:5001/api 
    # Đảm bảo URL này khớp với địa chỉ backend server của bạn
    ```

4.  **Chạy Frontend development server:**
    ```bash
    npm run dev
    ```
   
    Ứng dụng React sẽ được mở trên một cổng (thường là 3000 hoặc 5173) và tự động mở trong trình duyệt của bạn.

## Cơ sở dữ liệu

-   **Hệ quản trị CSDL:** MongoDB.
-   **ODM (Object Data Modeling):** Mongoose được sử dụng để tương tác với MongoDB, định nghĩa schema và model.
-   **Các Collections chính (Models):**
    * `User`: Lưu thông tin người dùng (Ứng viên, Nhà tuyển dụng, Quản trị viên), bao gồm thông tin đăng nhập, hồ sơ cá nhân/công ty, CV, kinh nghiệm, kỹ năng, v.v.
    * `Job`: Lưu thông tin các tin tuyển dụng (chức danh, mô tả, yêu cầu, quyền lợi, công ty đăng tuyển, v.v.).
    * `Application`: Lưu thông tin các đơn ứng tuyển của ứng viên vào các công việc.
    * `Company`: Lưu thông tin chi tiết về các công ty tuyển dụng.
    * `Test`: Lưu thông tin về các bài test mà nhà tuyển dụng tạo ra.
    * `Notification`: Lưu các thông báo gửi đến người dùng.
-   **Thiết lập CSDL:**
    * Đảm bảo MongoDB server của bạn đang chạy.
    * Khi backend khởi động lần đầu và kết nối tới MongoDB URI được cung cấp trong file `.env`, Mongoose sẽ tự động tạo database (nếu chưa tồn tại) và các collections khi có dữ liệu được ghi vào hoặc model được sử dụng.
    * Không cần file script database riêng để tạo cấu trúc như SQL, Mongoose sẽ quản lý việc này dựa trên định nghĩa schema trong các file model.

## Các lưu ý khác
-   **Thư mục `backend/uploads/cvs`:** Thư mục này dùng để lưu trữ các file CV do ứng viên tải lên. Đảm bảo thư mục này được tạo và có quyền ghi.
-   **API Endpoints:** Tham khảo các file trong `backend/routes` để biết chi tiết về các API endpoint của hệ thống.
-   **Mock Data:** Dự án có sử dụng một số dữ liệu giả lập trong thư mục `frontend/src/data` cho việc phát triển và demo ban đầu. Khi kết nối với backend thực tế, các dữ liệu này sẽ được thay thế bằng dữ liệu từ CSDL.