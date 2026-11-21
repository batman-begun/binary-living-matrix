# Binary Living Matrix

Showcase đồ họa tương tác. Cùng một trường chữ số nhị phân tạo thành dáng WOMAN đang thở, sóng OCEAN và các xung điện của BRAIN.

[Mở showcase](https://batman-begun.github.io/binary-living-matrix/) · [Xem video demo](https://batman-begun.github.io/binary-living-matrix/demo/matrix-demo.mp4) · [English](README.md)

- Chạm hoặc kéo trên phần canvas lộ ra để tạo sóng lan.
- Bấm bento để chuyển sang OCEAN. Sau chín giây không tương tác thêm, matrix tự về WOMAN.
- Vào ô nhập để hiện BRAIN. Gõ chữ tạo xung rồi rời ô nhập để quay lại WOMAN. Nội dung được xử lý trên thiết bị.
- Mở Lab để giữ một hình, chọn Auto/Eco/High, chỉnh chuyển động và xem số đo khi chạy.

Dùng Node.js 22.12 trở lên. Chạy `npm ci` rồi `npm run dev`. Dùng `npm run lint`, `npm test` và `npm run build` để kiểm tra. Cài Chromium và Firefox bằng `npx playwright install chromium firefox` rồi chạy `npm run test:browser`. Video có thể quay lại bằng `npm run record` sau khi build, với Chromium và FFmpeg đã cài.

[Kiến trúc](docs/architecture.md) · [Quy tắc hình ảnh](docs/visual-rules.md) · [Hiệu năng và UAT](docs/performance.md) · [Giấy phép MPL 2.0](LICENSE)
