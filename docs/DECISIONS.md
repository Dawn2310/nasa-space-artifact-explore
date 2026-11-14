# DECISIONS — Lead ghi mọi quyết định và thay đổi hợp đồng

| # | Ngày | Quyết định | Lý do |
|---|---|---|---|
| 1 | 2026-11-14 | Ba tầng solar → surface → artifact; 17 hiện vật theo đúng danh sách tài nguyên của đề | Phủ toàn bộ NASA resources của challenge |
| 2 | 2026-11-14 | Phân loại lại: Dawn, NEAR Shoemaker, Pioneer 10/11, Kepler thuộc deep-space, không thuộc Mars | Trang đề xếp nhầm; ứng dụng phải đúng |
| 3 | 2026-11-14 | Hai mức: 17 thẻ, chat cho opportunity / surveyor-3 / viking-1; pioneer-10 là stretch | Giới hạn 40 giờ, gánh nặng duyệt dữ kiện |
| 4 | 2026-11-14 | React + Vite + R3F, API serverless trên Vercel | Một nền tảng deploy, free tier |
| 5 | 2026-11-14 | LLM adapter có chế độ mock; đội chưa có khóa API | Toàn bộ app phải demo được không cần khóa |
| 6 | 2026-11-14 | Giao diện và nội dung bằng tiếng Anh | Yêu cầu nộp bài của Space Apps |
| 7 | 2026-11-14 | Chỉ người thật đổi reviewStatus sang approved | Tiêu chí Validity; agent có thể trích sai |
| 8 | 2026-11-14 | Retrieval: đưa toàn bộ facts đã lọc vào prompt, chưa dùng embeddings | Kho nhỏ (<= 50 facts mỗi nhân vật) |
| 9 | 2026-11-14 | Model và texture lấy từ nasa/NASA-3D-Resources, ghim commit 11ebb4ee, có sha256 | Nguồn chính thức, tái lập được, không chế |
| 10 | 2026-11-14 | 5 hiện vật không có GLB chính thức dùng ảnh NASA thay model | Không dựng model thay thế |
| 11 | 2026-11-14 | Texture Mặt Trăng lấy từ NASA SVS CGI Moon Kit, người thật tải | File Moon trong kho 3D là ảnh chụp, không phải bản đồ |
| 12 | 2026-11-14 | Thêm `src/shared/app-types.ts` (Lead sở hữu): `Catalog`, `ChatAdapter`, `WorldProps`, `ExplorerProps` và helper tra cứu. `contracts.ts` không đổi | App cần một hình dạng props thống nhất để world3d và ui-story làm song song |
| 13 | 2026-11-14 | `src/features/world/index.tsx` và `src/features/explorer/index.tsx` là điểm vào duy nhất (default export nhận WorldProps / ExplorerProps); App giữ ViewState | Agent thay nội dung mà không đụng App |
| 14 | 2026-11-14 | Phiên bản cài: React 19, three 0.187, @react-three/fiber 9, @react-three/drei 10, Vite 8, TypeScript 7 | Bản mới nhất tương thích nhau tại thời điểm scaffold; ghim trong package-lock.json |
