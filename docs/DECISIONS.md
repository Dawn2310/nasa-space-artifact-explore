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
| 15 | 2026-11-14 | Hiệu chuẩn `textures/mars.jpg`: tâm ảnh ở kinh độ 0°, mép trái/phải ở 180° (`MARS_TEXTURE_LEFT_EDGE_LON_EAST_DEG = -180` trong `src/features/world/geo.ts`). Bằng chứng: world3d ước lượng BẰNG MẮT trên ảnh 1440x720, Olympus Mons (18.65°N, 226.2°E) thấy ở x≈185,y≈285, công thức cho 184.8, 285.4; Hellas, Syrtis Major, Valles Marineris cũng khớp. Sai số đọc ảnh khoảng ±4° kinh độ. CHƯA đối chiếu tài liệu nguồn của texture | CLAUDE.md yêu cầu hiệu chuẩn marker bằng địa danh biết trước |
| 16 | 2026-11-14 | GLB tải bằng `GLTFLoader` + `DRACOLoader` của three với decoder đóng gói trong bundle, không dùng `useGLTF` | 8/9 model cần Draco; mặc định của drei lấy decoder từ CDN gstatic |
| 17 | 2026-11-14 | Nhãn trong cảnh dùng lớp tự viết (`labels.tsx`), không dùng `<Html>` của drei | `<Html>` ném lỗi removeChild với React 19 + StrictMode |
| 18 | 2026-11-14 | Giữ hai danh sách điều hướng; danh sách của world3d (dưới trái) là chính, danh sách trong khung briefing của ui-story thu gọn mặc định | Danh sách world3d highlight và quay globe; danh sách kia mở ra che vùng phải của cảnh |
| 19 | 2026-11-14 | Lời chào cuối nằm trong `src/features/explorer/storyText.ts`, chưa thêm trường vào `Artifact` | Tránh đổi hợp đồng giữa chừng |
| 20 | 2026-11-14 | Server chat mặc định chỉ dùng fact `approved`; thêm công tắc env `ALLOW_PENDING_FACTS=true` cho demo/eval cục bộ | Giữ quyết định 7 làm mặc định, nhưng app phải demo được khi chưa ai duyệt 255 fact |
| 21 | 2026-11-14 | `npm run dev` phục vụ POST /api/chat bằng middleware Vite gọi `server/chat.ts › handleChat`; `api/chat.ts` là wrapper Vercel mỏng | Không cần `vercel dev` để chạy cục bộ; một pipeline duy nhất |
| 22 | 2026-11-14 | Prompt hệ thống và persona máy đọc nằm trong `server/prompt.ts`, `server/personas.ts`; JSON nội dung import tĩnh | Function deploy không phải đọc file bằng fs, không cần `includeFiles` |
| 23 | 2026-11-14 | Lọc memoryCutoff: loại fact có `date` > cutoff, giữ fact đúng ngày cutoff | Câu "how did your mission end" dựa vào fact đúng ngày mất liên lạc |
