# Điểm danh và học phí

Hai trang riêng: `index.html` cho phụ huynh (chỉ xem), `admin.html` cho bạn (điểm danh, sửa).

## Chạy thử
Mở `admin.html` bằng một web server bất kỳ (hoặc sau khi deploy). Khi `config.js` còn để trống, dữ liệu chỉ lưu trên máy này.

## Đưa lên mạng và đồng bộ
1. Tạo repo **public** trên GitHub, tải toàn bộ file trong thư mục này lên (nhánh `main`).
2. Sửa `config.js`: điền `owner` (tên tài khoản GitHub) và `repo` (tên repo).
3. Tạo mã truy cập: GitHub, Settings, Developer settings, Fine-grained tokens. Chọn **chỉ repo này**, quyền **Contents: Read and write**.
4. Đăng ký hosting miễn phí, một trong hai:
   - **GitHub Pages**: Settings của repo, Pages, chọn nhánh `main`.
   - **Netlify**: Add new site, Import from Git, chọn repo, không cần cấu hình build.
5. Mở `admin.html` trên điện thoại của bạn, dán mã ở bước 3. Mã chỉ lưu trên máy bạn.
6. Gửi phụ huynh link của `index.html`. Phụ huynh không cần đăng nhập.

Dữ liệu nằm trong `data.json` của repo, mỗi lần điểm danh là một lần cập nhật file này.
Đừng gửi link `admin.html` hay mã GitHub cho ai khác.

## Nhắc đóng tiền
Cả hai trang tự hiện khung màu cam khi còn 3 ngày nữa là cuối tháng mà còn thiếu tiền, hoặc khi tháng trước còn thiếu. Muốn đổi số ngày báo trước, sửa `"remind"` trong `data.json`.

## Theo từng lớp
Mỗi lớp có phần tổng kết riêng (số buổi, tổng, đã đóng, còn phải đóng, nơi đóng). Khi ghi nhận tiền đã đóng, bạn chọn đóng cho lớp nào để số liệu tách đúng theo từng nơi.
