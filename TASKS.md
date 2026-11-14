# TASKS — bảng điều phối của Lead

Deadline nộp: Chủ nhật 15/11/2026 23:59 (giờ Việt Nam). Ngừng thêm tính năng: 17:00 Chủ nhật.

## Đợt 0 — Lead tự làm (mục tiêu: 1–2 giờ)

- [x] Tài nguyên 3D chính thức đã nằm trong public/assets/ (9 GLB, 6 texture, có sha256).
- [x] Chạy `bash scripts/verify_assets.sh` để xác nhận file nguyên vẹn. (16/16 OK)

- [x] Scaffold: Vite + React + TS, cài three, @react-three/fiber, @react-three/drei.
- [x] Thư mục: src/features/world, src/features/explorer, src/shared, api, server, prompts, content, eval, qa, public/assets.
- [x] `src/shared/mock.ts`: mock catalog (3 hiện vật: opportunity, surveyor-3, pioneer-10) + mock ChatResponse đúng contracts.
- [x] `src/App.tsx`: giữ ViewState, truyền SceneCallbacks cho world và state/catalog/chat adapter cho explorer.
- [x] `npm run dev` chạy, `npm run build` pass. Commit.

## Đợt 1 — chạy SONG SONG ba agent

- [ ] nasa-research: opportunity → surveyor-3 → viking-1 (chat), rồi 14 thẻ.
- [x] world3d: solar → mars → marker → viewer bằng mock.
- [x] ui-story: shell, card, chat panel bằng mock adapter; persona 3 nhân vật. (phần "emotional moments" còn TODO, chờ facts.json)

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

```
Task / Owner: Đợt 0 — scaffold / Lead (2026-11-14)
File đã tạo, sửa: package.json, package-lock.json, .gitignore, tsconfig*.json, vite.config.ts,
  index.html, src/main.tsx, src/App.tsx, src/index.css, src/vite-env.d.ts,
  src/shared/app-types.ts (Catalog, ChatAdapter, WorldProps, ExplorerProps + helper),
  src/shared/mock.ts (mockCatalog 3 hiện vật + mockChatAdapter),
  src/features/world/index.tsx và src/features/explorer/index.tsx (PLACEHOLDER, agent thay),
  scripts/verify_assets.sh (dùng `python` khi `python3` là stub trên Windows).
Cách chạy: npm install; npm run dev (http://localhost:5173); npm run build.
Đã kiểm tra: verify_assets 16/16 OK; npm run build pass (tsc -b + vite build);
  dev server trả 200 cho /, /src/App.tsx và /assets/models/mer-opportunity.glb (36668 byte).
Chưa kiểm tra: chưa mở trên trình duyệt thật (chưa bấm thử luồng solar → surface → artifact → back).
Phụ thuộc còn thiếu: mọi nội dung thật (content/catalog.json, facts.json, sources.json);
  mock.ts dùng tọa độ xấp xỉ và fact có tiền tố [MOCK], không được chép sang nội dung thật.
Bước tiếp theo: Đợt 1 — nasa-research, world3d, ui-story chạy song song.
```

```
Task / Owner: Đợt 1 — cảnh 3D ba tầng / world3d (2026-11-14)
File đã tạo, sửa: src/features/world/ — index.tsx, SolarScene.tsx, SurfaceScene.tsx, ArtifactScene.tsx,
  CameraRig.tsx, geo.ts, geo.check.mjs, labels.tsx, parts.tsx, layout.ts, world.css.
Cách chạy: npm run dev; node src/features/world/geo.check.mjs (assert tọa độ).
Đã kiểm tra (agent báo, Chrome headless + WebGL phần mềm, dev server, MOCK catalog): luồng solar → Mars →
  Opportunity → Back → Pioneer 10 → Moon → Surveyor 3 ở 1440x900; hover/click marker, click globe không
  điều hướng; GLB Opportunity + Pioneer 10 tải được (Draco decoder nội bộ, không CDN); chặn *.glb và tắt
  WebGL ra đúng fallback; màn 390x800. Lead chạy lại: geo.check qua, npm run build pass.
Chưa kiểm tra: GPU thật, cảm ứng thật, 7 GLB còn lại, 15 hiện vật còn lại, nhánh có ảnh, bản build
  production trong trình duyệt, thời lượng chuyển cảnh (chưa đo).
Phụ thuộc còn thiếu: public/assets/textures/moon.jpg (globe Mặt Trăng đang xám phẳng); catalog thật.
  Surveyor 3 và Apollo 12 ALSEP gần trùng tọa độ: chuột chỉ chọn được marker gần camera, danh sách chọn được cả hai.
Bước tiếp theo: nối catalog thật, bấm thử đủ 17 hiện vật.
```

```
Task / Owner: Đợt 1 — UI explorer + persona / ui-story (2026-11-14)
File đã tạo, sửa: src/features/explorer/ — index.tsx, ArtifactCard.tsx, FactCard.tsx, ChatPanel.tsx,
  MemoryJournal.tsx, Guidance.tsx, session.ts, storyText.ts, explorer.css;
  prompts/personas/ — opportunity.md, surveyor-3.md, viking-1.md, card-intros.md, catalog-story.json.
Cách chạy: npm run dev; Mars → Opportunity để thử chat mock; Pioneer 10 để thử thẻ không chat.
Đã kiểm tra: tsc sạch trong thư mục explorer; npm run build pass (Lead chạy sau khi world3d sửa layout.ts).
Chưa kiểm tra: CHƯA ai bấm thử UI trên trình duyệt (bố cục 440px / bottom sheet, bàn phím, focus);
  nhánh unavailable / lỗi mạng / Retry (mock không tạo ra); ảnh và bưu thiếp; catalog 17 hiện vật.
Phụ thuộc còn thiếu: facts.json để điền "Emotional moments" (TODO) và memoryCutoff của surveyor-3, viking-1;
  research duyệt "Claims to check" trong card-intros.md; hai câu lời chào cuối cần fact chống lưng hoặc cắt
  (Surveyor 3 "built to help others make the trip after me", Opportunity "Other machines carry on the work").
Bước tiếp theo: Lead gộp catalog-story.json vào catalog thật; grounded-chat lấy câu từ chối từ persona.
```

```
Task / Owner: Mốc ghép 1 (MOCK) / Lead (2026-11-14)
File đã tạo, sửa: src/features/explorer/Guidance.tsx (danh sách thu gọn mặc định), src/shared/chat-adapter.ts
  (adapter gọi /api/chat, CHƯA nối vào App), TASKS.md, docs/DECISIONS.md.
Đã kiểm tra: npm run build pass; geo.check qua.
Chưa kiểm tra: Lead chưa tự mở trình duyệt; toàn bộ vẫn là dữ liệu MOCK, chat MOCK.
Bước tiếp theo: chờ nasa-research, rồi Đợt 2 (catalog thật + /api/chat).
```
