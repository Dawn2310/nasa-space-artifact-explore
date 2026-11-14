# TASKS — bảng điều phối của Lead

Deadline nộp: Chủ nhật 15/11/2026 23:59 (giờ Việt Nam). Ngừng thêm tính năng: 17:00 Chủ nhật.

## Đợt 0 — Lead tự làm (mục tiêu: 1–2 giờ)

- [x] Tài nguyên 3D chính thức đã nằm trong public/assets/ (9 GLB, 6 texture, có sha256).
- [ ] Chạy `bash scripts/verify_assets.sh` để xác nhận file nguyên vẹn.

- [ ] Scaffold: Vite + React + TS, cài three, @react-three/fiber, @react-three/drei.
- [ ] Thư mục: src/features/world, src/features/explorer, src/shared, api, server, prompts, content, eval, qa, public/assets.
- [ ] `src/shared/mock.ts`: mock catalog (3 hiện vật: opportunity, surveyor-3, pioneer-10) + mock ChatResponse đúng contracts.
- [ ] `src/App.tsx`: giữ ViewState, truyền SceneCallbacks cho world và state/catalog/chat adapter cho explorer.
- [ ] `npm run dev` chạy, `npm run build` pass. Commit.

## Đợt 1 — chạy SONG SONG ba agent

- [ ] nasa-research: opportunity → surveyor-3 → viking-1 (chat), rồi 14 thẻ.
- [ ] world3d: solar → mars → marker → viewer bằng mock.
- [ ] ui-story: shell, card, chat panel bằng mock adapter; persona 3 nhân vật.

Mốc ghép 1 (mục tiêu 13:00 thứ Bảy): solar → mars → Opportunity → thẻ → chat MOCK → back.

## Đợt 2 — sau khi có facts của Opportunity

- [ ] grounded-chat: /api/chat, kiểm chứng, chế độ mock, eval cho Opportunity.
- [ ] Lead: nối chat adapter thật, nối catalog thật vào world + explorer.

Mốc ghép 2 (mục tiêu 20:00 thứ Bảy): đường đi Opportunity chạy với API (mock LLM), deploy thử lên Vercel.

## Đợt 3 — mở rộng

- [ ] Mặt Trăng + Surveyor 3; Viking 1; đủ 17 thẻ; chấm deep-space ở solar.
- [ ] qa: chạy sau mốc ghép 2 và sau mỗi lần mở rộng.

Mốc ghép 3 (mục tiêu 12:00 Chủ nhật): đủ 17 thẻ, 3 nhân vật chat, có số eval.

## Đợt 4 — đóng băng và nộp (từ 17:00 Chủ nhật)

- [ ] Sửa lỗi chặn demo trong qa/bugs.md. Tối ưu model (gltf-transform), fallback.
- [ ] Người thật: cắm LLM_API_KEY thật trên Vercel, chạy lại eval, thử trên máy khác.

## Việc của NGƯỜI THẬT (agent không làm thay)

- [ ] Tải texture Mặt Trăng (CGI Moon Kit, svs.gsfc.nasa.gov/4720, file lroc_color_2k.jpg) vào public/assets/textures/moon.jpg và thêm mục vào content/assets.json.
- [ ] Tải ảnh NASA cho 5 hiện vật không có model (images.nasa.gov), ghi NASA ID.
- [ ] Mở từng trang model trên science.nasa.gov/3d-resources để chép tên người đóng góp vào CREDITS.md.
- [ ] Duyệt dữ kiện: mở link nguồn, đổi reviewStatus "pending" → "approved" trong content/facts.json. Chia theo body: moon / mars (2 người) / deep-space.
- [ ] Hạ tầng: repo GitHub công khai, project Vercel, biến môi trường LLM_PROVIDER + LLM_API_KEY.
- [ ] Trang nộp bài tiếng Anh: summary, mô tả chi tiết, NASA Data (lấy từ sources.json), khai báo AI (Claude Code + các agent, phần nào do AI sinh).
- [ ] Demo: video <= 30 giây có phụ đề tiếng Anh HOẶC <= 7 slide. Link công khai.
- [ ] Kiểm tra mọi link ở cửa sổ ẩn danh, bấm "Submit for Judging" trước 22:00.

## Cắt giảm nếu trễ (theo thứ tự)

1. Bỏ model 3D của hiện vật card → dùng ảnh.
2. Bỏ sổ ký ức, lời chào cuối kích hoạt bằng nút.
3. Giảm chat còn Opportunity + Surveyor 3.
4. Thẻ deep-space còn Pioneer 10 + Kepler.
Không bao giờ cắt: nguồn cho mỗi dữ kiện, nút back, nhãn Not to scale, một đường đi hoàn chỉnh.

## Nhật ký bàn giao

Mẫu (agent điền vào cuối file sau mỗi task):

```
Task / Owner:
File đã tạo, sửa:
Cách chạy:
Đã kiểm tra:
Chưa kiểm tra:
Phụ thuộc còn thiếu:
Bước tiếp theo:
```
