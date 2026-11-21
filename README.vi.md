# Binary Living Matrix

Showcase tương tác từ các chữ số nhị phân. WOMAN thở nhẹ, với dáng nghiêng kéo xuống đùi trên. Bấm bento để chuyển sang OCEAN, focus prompt để hiện BRAIN, hoặc chạm và kéo ở vùng chữ số lộ ra để tạo vết lõm đàn hồi. Vào Open Lab để chọn hình, dừng chuyển động hoặc reset.

Dùng Node.js 22.12 trở lên và npm. Chạy `npm ci` rồi `npm run dev`. Chạy `npm run build` để xuất bản build và `npm run preview` để xem bản build.

React bố trí trang. Các module TypeScript trong `src/matrix/` tạo glyph, lấy mẫu hình thể và vẽ lên Canvas 2D. Tất cả glyph dùng chung font monospace cỡ 8 CSS px.

Còn chờ UAT chuyển động trên Android thật, đo hiệu năng và hoàn thiện diagnostics trong Lab. Chạy `npm test` để kiểm tra regression cho phần vẽ và chuyển động.

Mã nguồn dùng [Mozilla Public License 2.0](LICENSE).
