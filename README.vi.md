# Binary Living Matrix

Bản thử thị giác cho một showcase tạo từ các chữ số nhị phân. Bản này vẽ dáng nghiêng WOMAN bằng các số 0 và 1 trên nền ngà.

Dùng Node.js 22.12 trở lên và npm. Chạy `npm ci` rồi `npm run dev`. Chạy `npm run build` để xuất bản build và `npm run preview` để xem bản build.

React bố trí trang. Các module TypeScript trong `src/matrix/` tạo glyph, lấy mẫu hình thể và vẽ lên Canvas 2D. Tất cả glyph dùng chung font monospace cỡ 8 CSS px.

Gate A còn chờ nghiệm thu thị giác trên Android thật. Thở, morph, touch và Lab thuộc các mốc triển khai tiếp theo.

Mã nguồn dùng [Mozilla Public License 2.0](LICENSE).
