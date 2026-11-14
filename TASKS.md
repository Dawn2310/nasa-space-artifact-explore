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

- [x] nasa-research: opportunity → surveyor-3 → viking-1 (chat), rồi 14 thẻ. (255 fact, tất cả pending — chờ người duyệt)
- [x] world3d: solar → mars → marker → viewer bằng mock.
- [x] ui-story: shell, card, chat panel bằng mock adapter; persona 3 nhân vật. (phần "emotional moments" còn TODO, chờ facts.json)

Mốc ghép 1 (mục tiêu 13:00 thứ Bảy): solar → mars → Opportunity → thẻ → chat MOCK → back.

## Đợt 2 — sau khi có facts của Opportunity

- [x] grounded-chat: /api/chat, kiểm chứng, chế độ mock, eval cho Opportunity. (cả 3 nhân vật; CHỈ chạy mock, provider thật chưa thử)
- [x] Lead: nối chat adapter thật, nối catalog thật vào world + explorer. (chưa deploy thử Vercel)

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
- [ ] Tải ảnh NASA cho 5 hiện vật không có model (images.nasa.gov), ghi NASA ID. (agent đã tải 40 ảnh cho cả 17 hiện vật, có NASA ID + sha256 trong assets.json; người thật cần MỞ XEM từng ảnh)
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

```
Task / Owner: Đợt 1 — dữ kiện, nguồn, ảnh / nasa-research (2026-11-14)
File đã tạo, sửa: content/sources.json (59 nguồn), content/facts.json (255 fact, tất cả reviewStatus pending),
  content/catalog.json (17 hiện vật), content/assets.json (+40 mục ảnh img-<artifactId>-<n>),
  public/assets/images/<artifactId>-<n>.jpg (40 ảnh, ~6 MB).
Số fact: opportunity 50, viking-1 48, surveyor-3 45, 14 thẻ còn lại 8 fact mỗi thẻ.
Đã kiểm tra (agent báo): mọi fact dựa trên trang đã tải thật bằng curl (NSSDCA, science.nasa.gov, nasa.gov,
  images-api.nasa.gov, GeoJSON waypoint của mars.nasa.gov); kiểm tra chéo sourceIds / factIds / assetIds;
  sha256 40 ảnh; sáu sự thật bắt buộc. Lead kiểm thêm: cả 14 tọa độ được geo.ts đọc là kinh độ Đông dương, đúng dấu.
Chưa kiểm tra / lỗ hổng (NGƯỜI DUYỆT ưu tiên xem):
  1. Chỉ 3/40 ảnh được mở xem; verifiedAvailability=true nghĩa là tải được, chưa có người kiểm.
  2. Không có tọa độ nơi dừng cuối của Opportunity (Perseverance Valley), Spirit (Home Plate); catalog chỉ có landing.
  3. LRV Apollo 15: dùng tọa độ Lunar Module Apollo 15, kind "landing", nhãn nói rõ.
  4. memoryCutoff Ingenuity 2024-01-25 và Kepler 2018-10-30 là ngày NASA công bố kết thúc, không phải liên lạc cuối.
  5. "Valinor Hills" ↔ tọa độ Flight 72: agent ghép hai nguồn (chú thích PIA26237 + file waypoint ghi "Airfield Chi").
  6. Nguồn NASA mâu thuẫn: Viking 1 kết thúc 11/11 hay 13/11/1982; Mutch Station 1981 hay 1982; Viking 2 kết thúc
     11/04 hay 12/04/1980 và hai bộ tọa độ; Apollo 12 hạ cánh 18 hay 19/11/1969; Phoenix hai bộ tọa độ;
     ngày phóng Pioneer 10, Kepler lệch do UT.
  7. Trường date của sự kiện chỉ biết tháng/năm: đặt ngày cuối tháng hoặc 31/12 (quy ước của agent).
  8. Ảnh không phải ảnh chụp hiện vật thật: dawn-1, dawn-2, near-shoemaker-1, kepler-2 (artist concept),
     pioneer-11-1 (tranh vẽ), viking-1-3 (mô hình trên Trái Đất); pioneer-10-1 credit TRW. `represents` ghi rõ.
  9. jpl.nasa.gov trả 403; science.nasa.gov cho Apollo 11/12/15 và Sojourner trả 404 → các thẻ này chỉ dựa NSSDCA.
Chỉnh so với seed: surveyor-3 "1967", cutoff 1967-05-04; spirit cutoff 2010-03-22; viking-1 1982-11-11;
  viking-2 1980-04-11; apollo-12-alsep 1977-09-30; sojourner 1997-09-27; phoenix 2008-11-02; insight 2022-12-15;
  dawn 2018-10-31; near-shoemaker 2001-02-28; pioneer-11 1995-11-24. URL nguồn đúng cho phoenix, viking-2,
  pioneer-11, opportunity, spirit nằm trong sources.json (seed ghi sai).
Phụ thuộc còn thiếu: người thật duyệt 255 fact; texture Mặt Trăng.
Bước tiếp theo: grounded-chat dùng facts.json; Lead gộp intro từ prompts/personas/catalog-story.json (đã làm trong src/shared/catalog.ts).
```

```
Task / Owner: Nối catalog thật / Lead (2026-11-14)
File đã tạo, sửa: src/shared/catalog.ts (gộp content/*.json + catalog-story.json), src/App.tsx (dùng realCatalog),
  src/shared/mock.ts (createMockChatAdapter), vite.config.ts (middleware dev cho POST /api/chat → server/chat.ts).
Đã kiểm tra: npm run build pass; verify_assets 16/16.
Chưa kiểm tra: chưa mở trình duyệt với 17 hiện vật thật; chat vẫn là adapter giả trong trình duyệt.
Bước tiếp theo: nối /api/chat khi grounded-chat bàn giao.
```

```
Task / Owner: Đợt 2 — grounded chat / grounded-chat (2026-11-14)
File đã tạo, sửa: server/chat.ts (handleChat), server/llm.ts, server/mock-llm.ts, server/personas.ts,
  server/prompt.ts, server/text.ts, api/chat.ts, eval/questions.json (86 câu), eval/fixtures.json,
  eval/run.ts, eval/results.md, .env.example.
Cách chạy: node eval/run.ts (chạy cả hai chế độ, ghi eval/results.md); npm run dev với .env có ALLOW_PENDING_FACTS=true.
Số eval — MOCK (đo đường ống + bộ khớp từ khóa, KHÔNG phải LLM thật; agent chỉnh từ đồng nghĩa sau khi thấy câu hỏi):
  ALLOW_PENDING_FACTS=true: grounded đúng 41/42, mọi fact dẫn đúng 39/42, từ chối đúng 41/44, evidence hợp lệ 86/86.
  Strict mặc định (chỉ approved): 86/86 câu bị từ chối vì 143/143 fact của ba nhân vật còn pending.
  4 câu sai để nguyên: sv3-q07, sv3-q23, vk1-q18, vk1-q23 (xem eval/results.md).
Đã kiểm tra: tsc sạch, build pass, 23/23 kiểm tra pipeline (đầu vào, lọc cutoff, bộ kiểm chứng, thiếu khóa → unavailable);
  curl vào middleware dev; bundle client không chứa LLM_API_KEY.
Chưa kiểm tra: BA PROVIDER THẬT chưa gọi lần nào (không có khóa; model mặc định gpt-5-mini, gemini-2.5-flash chưa
  xác minh); timeout 20s / lỗi mạng thật; api/chat.ts trên Vercel (rủi ro: import đuôi .ts và `with { type: 'json' }`
  chưa chắc builder Vercel nhận — nếu không thì phải bundle bằng esbuild); chống prompt-injection với LLM thật.
Phụ thuộc còn thiếu: người duyệt facts; khóa LLM.
Nội dung cần người duyệt xem: opp-041, opp-042 mang date 2019-02-13 nên bị cutoff loại dù là việc trong nhiệm vụ;
  opp-050 (Perseverance vượt kỷ lục 11/10/2026) cần kiểm; vk1-046 bị cutoff loại; mock trả lời lẫn ngôi "I" / "it".
```

```
Task / Owner: Mốc ghép 2 / Lead (2026-11-14)
File đã tạo, sửa: src/App.tsx (dùng apiChatAdapter), vercel.json (maxDuration 30s cho api/chat.ts),
  eval/fixtures.json (thêm fixture cho câu gợi ý mới của Surveyor 3), .env cục bộ (không commit:
  LLM_PROVIDER=mock, ALLOW_PENDING_FACTS=true), ui-story cập nhật persona bằng fact id thật.
Đã kiểm tra: npm run build pass; node eval/run.ts cho đúng số ở trên; cả 9 câu gợi ý của 3 nhân vật trả về
  "grounded" qua handleChat (mock, pending); curl POST /api/chat qua dev server: câu có đáp án → grounded có nguồn,
  câu ngoài kho và sau cutoff → insufficient-evidence.
Chưa kiểm tra: CHƯA bấm thử UI trên trình duyệt với API (chỉ thử bằng curl); CHƯA deploy Vercel.
Lưu ý trung thực: khi ALLOW_PENDING_FACTS=true, ChatResponse không báo "fact chưa duyệt"; UI chỉ hiện nhãn
  "Awaiting review" trên thẻ fact trong Sources. Trên Vercel nếu không đặt biến này thì chat từ chối mọi câu
  cho tới khi fact được duyệt.
Bước tiếp theo: qa; người thật duyệt facts, tạo repo + Vercel, bấm thử trên trình duyệt.
```
