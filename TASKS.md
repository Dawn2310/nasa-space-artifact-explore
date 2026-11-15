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

Task / Owner: Đổi tên giao diện / Codex (2026-11-14)
File đã sửa: src/features/explorer/storyText.ts, src/features/explorer/index.tsx, index.html.
Thay đổi: tên ứng dụng và tab trình duyệt là NASA Space Artifact Explorer; bỏ dòng Student project / Not affiliated theo yêu cầu người dùng; cập nhật meta description.
Đã kiểm tra: npm run build pass.
Chưa kiểm tra: chưa xem lại bố cục trên trình duyệt.
Phụ thuộc còn thiếu: không có cho thay đổi này.
Bước tiếp theo: tải lại demo để xem tiêu đề mới.

Task / Owner: Thu gọn danh sách điều hướng / Codex (2026-11-14)
File đã sửa: src/features/world/world.css.
Thay đổi: giảm chiều rộng khung từ 300px xuống 240px, giới hạn chiều cao 40% (38% trên màn hình hẹp), giảm cỡ chữ và khoảng cách các mục; giữ vùng bấm tối thiểu 44px.
Đã kiểm tra: npm run build pass; kiểm tra diff.
Chưa kiểm tra: bố cục trực tiếp trên trình duyệt.
Phụ thuộc còn thiếu: không có.
Bước tiếp theo: xem lại khung Places and spacecraft trên demo.

Task / Owner: Thu gọn và ẩn Mission briefing / Codex (2026-11-14)
File đã sửa: src/features/explorer/Guidance.tsx, src/features/explorer/explorer.css.
Thay đổi: giảm khung từ 340px xuống 270px, giảm cỡ chữ và padding; thêm Hide / Show briefing để ẩn nội dung và mở lại; giữ trạng thái danh sách khi thu gọn.
Đã kiểm tra: npm run build pass; kiểm tra CSS hidden và aria-expanded / aria-controls.
Chưa kiểm tra: thao tác trong trình duyệt.
Phụ thuộc còn thiếu: không có.
Bước tiếp theo: xem lại demo.

Task / Owner: Thu hẹp thêm Mission briefing / Codex (2026-11-14)
File đã sửa: src/features/explorer/explorer.css.
Thay đổi: giảm chiều rộng từ 270px xuống 220px, giữ neo bên phải theo ảnh người dùng.
Đã kiểm tra: kiểm tra diff CSS; thay đổi chỉ một giá trị chiều rộng.
Chưa kiểm tra: bố cục trực tiếp trên trình duyệt.
Phụ thuộc còn thiếu: không có.
Bước tiếp theo: xem lại demo.

Task / Owner: Ngân Hà và chuyển động quỹ đạo / Codex (2026-11-14)
File đã sửa: src/features/world/SolarScene.tsx, src/features/world/index.tsx, src/features/world/world.css, content/assets.json, CREDITS.md; thêm public/assets/images/milky-way-stars.jpg.
Thay đổi: nền Milky Way NASA SVS; tám hành tinh quay quanh Mặt Trời, Moon quanh Earth; nhãn/vùng bấm đi cùng vật thể; dừng Earth/Moon hoặc Mars khi hover/focus để dễ chọn; Pause/Resume, mặc định dừng nếu prefers-reduced-motion; tốc độ minh họa, không mô phỏng vị trí hiện tại.
Đã kiểm tra: npm run build pass; checksum toàn bộ 57 assets pass; xem nền trên Chrome tại zoom 125%; Pause/Resume đổi trạng thái, chọn Mars từ danh sách và Back về solar hoạt động.
Chưa kiểm tra: điện thoại/cảm ứng thật; click trực tiếp hành tinh đang chuyển động; reduced-motion trên thiết bị thật.
Phụ thuộc còn thiếu: không có cho thay đổi này.
Bước tiếp theo: xem demo và điều chỉnh tốc độ nếu cần.

Task / Owner: Nâng chất lượng hình ảnh hành tinh / Codex (2026-11-14)
File đã sửa: thêm src/features/world/PlanetVisuals.tsx và public/assets/models/planet-{sun,mercury,saturn}.glb; sửa SolarScene.tsx, content/assets.json, CREDITS.md.
Thay đổi: tham khảo NASA Eyes và model NASA VTAD; dùng nguyên GLB Mặt Trời/Sao Thủy/Sao Thổ, chuẩn hóa Saturn theo thân thay vì vành; gắn texture NASA có sẵn cho Venus/Jupiter/Neptune; shader viền khí quyển, glow Mặt Trời, ánh sáng ngày/đêm và tự xoay; Suspense và error boundary dùng globe dự phòng. Không sửa contracts hay model hiện vật; Moon vẫn dùng fallback theo quy định hiện tại.
Đã kiểm tra: npm run build pass; 60/60 checksum tài nguyên pass; xem trực tiếp Chrome zoom 125%, texture Jupiter, vành Saturn và bề mặt/glow Sun hiện đúng; thử phóng to và Pause.
Chưa kiểm tra: GPU điện thoại thật, lỗi tải GLB thực tế và tốc độ mạng chậm; ba GLB thêm khoảng 12.9 MB tải khi vào solar.
Phụ thuộc còn thiếu: không có cho nâng cấp này.
Bước tiếp theo: xem demo mới, Resume orbits nếu đang dừng khi kiểm tra.

Task / Owner: Vệ tinh, model tàu và camera cận cảnh / Codex (2026-11-14)
File đã thêm: src/features/world/solar-system.ts, InspectionTarget.tsx; 10 texture NASA cho Moon/Io/Europa/Ganymede/Callisto/Enceladus/Titan/Miranda/Titania/Triton; 2 GLB NASA cho Phobos/Deimos.
File đã sửa: SolarScene.tsx, PlanetVisuals.tsx, CameraRig.tsx, ArtifactScene.tsx, index.tsx, layout.ts, geo.ts, world.css, content/assets.json, CREDITS.md.
Thay đổi: 11 vệ tinh mới quay quanh đúng hành tinh; Triton ngược chiều; model hình dạng thật của Phobos/Deimos; Moon có map LROC. Thay 5 chấm deep-space bằng GLB NASA có sẵn (Pioneer 11 dùng model Pioneer 10, có nhãn). Chọn thiên thể để camera theo và xem gần; dropdown hỗ trợ chọn các vật thể nhỏ; nút +/- và Overview; Explore artifacts cho Moon/Mars; gần hơn ở surface và artifact. Không đổi ViewState/contracts; trạng thái focus chỉ phục vụ camera trong solar. Giữ nguồn và nhãn quỹ đạo/tỉ lệ minh họa, chỉ hiển thị một số vệ tinh tiêu biểu.
Đã kiểm tra: npm run build pass; geo.check pass; 72/72 checksum tài nguyên pass; 10 bản đồ mới đọc được và có tỉ lệ 2:1; git diff --check pass.
Chưa kiểm tra: người dùng dừng Computer Use bằng Esc trước khi kiểm tra UI mới; chưa xác nhận trực tiếp camera bám vệ tinh, zoom sát và GLB tàu trong solar, thao tác cảm ứng/mobile. Các model dùng decoder Draco nội bộ; có fallback khi tải lỗi.
Phụ thuộc còn thiếu: không có khóa hoặc dịch vụ mới; ảnh/model thêm tải cục bộ.
Bước tiếp theo: người dùng mở demo, chọn Jupiter/Phobos/Moon/Pioneer để xem gần; kiểm tra UI độc lập khi được tiếp tục điều khiển trình duyệt.

Task / Owner: Bỏ bảng điều khiển và hoàn thiện tương tác trực tiếp / Codex (2026-11-14)
File đã sửa: src/features/world/index.tsx, CameraRig.tsx, InspectionTarget.tsx, SolarScene.tsx, world.css.
Thay đổi: bỏ toàn bộ khung Inspect/dropdown/+/-/Pause; chọn trực tiếp model và cuộn/pinch để zoom. Khi chọn chỉ hiện thanh nhỏ ở đáy: tên, Back to Solar system, mở thẻ/hiện vật và các vệ tinh của hành tinh đang xem. Nhãn không liên quan được ẩn khi focus. Danh sách Places có mục Planets and moons thu gọn để chọn bằng bàn phím/vật thể nhỏ; không thêm bảng điều khiển thường trực.
Đã kiểm tra: npm run build pass; geo.check pass; git diff --check pass. Chrome 125%: khung Inspect không xuất hiện; click Mặt Trời mở camera cận cảnh, texture model hiện rõ, model Kepler và bề mặt Moon/Earth/Jupiter cùng vệ tinh thấy trong cảnh; Back trả về toàn cảnh. Kiểm tra hình học độc lập bằng camera-controls thật trong Node (không điều khiển UI): camera theo mục tiêu di chuyển, dolly giới hạn ngoài thân nhỏ, zoom không mất mục tiêu và reset overview đều pass.
Chưa kiểm tra: chọn trực tiếp mọi vệ tinh nhỏ, vòng chuyển solar/spacecraft/artifact nhiều lần, thiết bị cảm ứng thật. Lượt này không kết luận đã QA toàn bộ 17 hiện vật.
Phụ thuộc còn thiếu: không có cho thay đổi này.
Bước tiếp theo: người dùng xem demo mới bằng bấm model và cuộn chuột.

Task / Owner: Nền thiên hà 3D và sao băng / Codex (2026-11-14)
File đã thêm: src/features/world/SpaceBackdrop.tsx.
File đã sửa: src/features/world/index.tsx, world.css, CREDITS.md.
Thay đổi: ảnh NASA Deep Star Maps trên vòm cầu 3D, nền sao nhiều lớp và thiên hà xoắn ốc 6200 hạt có độ dày/rotation nhẹ; ba vệt sao băng định kỳ có đầu 3D và đuôi shader gradient mờ dần. Nền ở phía xa, không nhận raycast; giữ ảnh CSS chỉ cho fallback không WebGL. Hiệu ứng chuyển động tắt khi prefers-reduced-motion. Không thêm thư viện/ảnh AI; phần galaxy/meteor là minh họa.
Đã kiểm tra: npm run build pass sau sửa key shader khi texture tải; git diff --check pass; HTTP dev server phục vụ SpaceBackdrop và không còn world-inspect. Trong Chrome đã thấy vòm trời tối, cụm xoắn ốc và vệt sáng ngắn phía nền; phát hiện và sửa lỗi material không biên dịch lại khi texture load làm nền xám.
Chưa kiểm tra: lượt kiểm tra click/đổi cảnh chưa hoàn tất; công cụ Computer Use tự dừng vì không xác định URL hiện tại đủ chắc chắn. Có lúc Chrome hiển thị bản cũ có Inspect trong khi HTTP/module hiện tại đã đúng; cần hard reload để kiểm tra bản mới. Chưa kiểm thử cảm ứng/GPU di động hoặc hiệu năng định lượng.
Phụ thuộc còn thiếu: không có tài nguyên/dịch vụ mới.
Bước tiếp theo: hard reload demo và quan sát nền/sao băng, kiểm tra chuyển cảnh khi có thể điều khiển trình duyệt tiếp.

Task / Owner: Quỹ đạo rõ, rà chuyển động, cố định thiên hà và tăng sao băng / Codex (2026-11-14)
File đã thêm: scene-motion.ts (cấu hình kèm nguồn NASA + hàm chuyển động minh họa), scene-motion.check.mjs; body-ceres.glb và body-eros.glb nguyên bản NASA VTAD.
File đã sửa: SpaceBackdrop.tsx, SolarScene.tsx, ArtifactScene.tsx, index.tsx, content/assets.json, CREDITS.md.
Thay đổi: quỹ đạo hai lớp giữ độ rộng theo pixel, màu vàng khi focus; đường Pioneer nét đứt bay ra ngoài. Kepler quanh Sun; Dawn quanh Ceres và Ceres quanh Sun; NEAR giữ nguyên offset trên Eros, Eros quay/chuyển động; Pioneer bán kính tăng liên tục, không chạy vòng. Bỏ tự xoay model viewer, bỏ việc dừng quỹ đạo Earth/Mars khi hover; Venus xoay ngược, các moon spin cùng tốc độ quỹ đạo minh họa. Thiên hà có world transform cố định, không chép camera quaternion/position và không tự xoay. Sao băng tăng 3 lên 9, đầu và đuôi 3D sáng/dài, shader halo; mỗi vệt chỉ lấy góc camera lúc spawn, sau đó giữ hướng thế giới. Bật rõ meteor theo yêu cầu người dùng, không phụ thuộc cờ giảm chuyển động hành tinh.
Đã kiểm tra: build pass; geo.check và scene-motion.check pass (Kepler có quỹ đạo, Dawn ở quanh host, NEAR cố định tương đối Eros, Pioneer đi xa dần không vòng lại; meteor opacity/timing có giới hạn, trung bình 2.10 và đỉnh 4 vệt cùng hoạt động); checksum 74/74 pass; git diff --check pass. Chrome: xem quỹ đạo nổi rõ, Ceres/Eros/model trên cảnh; kéo camera thấy thiên hà đổi vị trí chiếu và rời khung theo hướng nhìn, không giữ một vị trí trên màn; đã thấy vệt meteor 3D dài sáng. Console không có lỗi WebGL shader, chỉ cảnh báo THREE.Clock deprecated. Đóng DevTools sau kiểm tra.
Chưa kiểm tra: benchmark GPU/điện thoại; quỹ đạo hiện tại không phải ephemerides thực; placement trên Eros không phải tọa độ hạ cánh thật.
Phụ thuộc còn thiếu: không có dịch vụ mới. Không tự duyệt mission facts.
Bước tiếp theo: người dùng tải lại demo để xem các thay đổi.

Task / Owner: Hai thiên hà quay, giảm sáng quỹ đạo và kiểm tra vị trí hiện vật / Codex (2026-11-14)
File đã sửa: SpaceBackdrop.tsx, scene-motion.ts, scene-motion.check.mjs, SolarScene.tsx, world/index.tsx, world.css, explorer/storyText.ts, CREDITS.md, docs/DECISIONS.md; thêm docs/LOCATION-MOTION-AUDIT.md.
Thay đổi: thiên hà lớn và thiên hà nhỏ 3400 hạt tự quay quanh tâm/trục cố định, không theo camera; tâm thiên hà nhỏ ở góc chéo đối diện trong overview. Giảm opacity quỹ đạo thường từ 0.65 còn 0.32, giảm lớp glow/độ rộng và đường Pioneer. Rà đủ 17 hiện vật bằng nguồn NASA; Kepler có quỹ đạo riêng với drift, bỏ offset NEAR đoán trên Eros (overview dùng host Eros, story card giữ GLB tàu). Focus spacecraft có liên kết NASA và giải thích riêng Eros. Không đổi tọa độ catalog, nội dung fact hoặc trạng thái duyệt.
Đã kiểm tra: npm run build pass; scene-motion.check và geo.check pass; git diff --check pass. Kiểm tra hình học xác nhận hai tâm thiên hà nằm trong khung và ở hai góc chéo đối diện qua camera overview; đổi hướng camera thay đổi vị trí chiếu. HTTP dev server đã phục vụ mã GALAXIES/config.speed mới.
Chưa kiểm tra: chưa xác nhận hình ảnh cuối của bản mới. CUA mở được demo, chuyển Mars về solar, nhưng screenshot có dấu hiệu mã cũ; khi yêu cầu reload, công cụ tự dừng vì không xác định chắc URL hiện tại. Không tiếp tục điều khiển Chrome sau lệnh dừng. Chưa benchmark GPU/thiết bị di động; chuyển động vẫn là sơ đồ, không phải ephemerides.
Phụ thuộc còn thiếu: không có khóa API hay tài nguyên mới cho thay đổi này.
Bước tiếp theo: tải lại http://127.0.0.1:5173/ để xem bản mới và xác nhận mức sáng/tốc độ quay bằng mắt.

Task / Owner: Giảm tên nổi trong cảnh solar / Codex (2026-11-14)
File đã sửa: src/features/world/SolarScene.tsx, TASKS.md.
Thay đổi: chỉ còn bốn nhãn Sun, Mars, Earth, Moon trong cảnh 3D; ẩn tên các hành tinh khác, vệ tinh phụ và spacecraft, bỏ dòng đếm hiện vật khi hover. Thêm nhãn Sun. Tên trong danh sách và thanh chọn vẫn phục vụ việc nhận diện; ghi chú Positions and speeds are illustrative áp dụng toàn cảnh.
Đã kiểm tra: npm run build pass; rà mã xác nhận đúng bốn vị trí SceneLabel còn lại trong SolarScene.
Chưa kiểm tra: hình ảnh trực tiếp trên trình duyệt ở lượt này.
Phụ thuộc còn thiếu: không có.
Bước tiếp theo: tải lại demo để xem bố cục gọn hơn.

Task / Owner: Nhân vật chuyển động và kể chuyện tuần tự / Codex (2026-11-14)
File đã thêm: src/shared/character-activity.tsx, src/features/explorer/narrative.ts, Storyteller.tsx, eval/storyteller.check.mjs.
File đã sửa: src/App.tsx, world/index.tsx, ArtifactScene.tsx, explorer/index.tsx, ChatPanel.tsx, explorer.css, content/catalog.json (mode), server/personas.ts, mock-llm.ts, eval/run.ts, eval/results.md, docs/DECISIONS.md, CREDITS.md, TASKS.md.
Thay đổi: màn hình mặc định là nhân vật kể chuyện từng chương với chữ hiện dần, tự chuyển chương/Trước/Tiếp/Bắt đầu lại; Dawn có 8 đoạn (lời chào + 7 chương) dựa trên fact có nguồn. Mở rộng chat cho 17 hiện vật; persona bổ sung chỉ dùng kho fact, giữ nguyên kiểm chứng server. Robot SVG có mắt/miệng/đầu chuyển động và model NASA nhún/nghiêng cả nhóm theo trạng thái kể/chờ, không sửa mesh. TTS tiếng Anh của trình duyệt chỉ bật khi người dùng chọn Enable voice, có fallback khi không hỗ trợ/lỗi; reduced-motion tắt cử động nhân vật/chữ chạy. Tab Mission records giữ dữ liệu chi tiết và nguồn. Sửa lỗi mở trang tự cuộn qua lời chào do chat rỗng scrollIntoView.
Đã kiểm tra: build pass; node eval/storyteller.check.mjs pass (17 câu chuyện/route API/persona, số trong chương có evidence, thiếu nguồn và fact sau cutoff không vào chương, ba câu gợi ý Dawn có nguồn, strict mode vẫn từ chối fact chưa duyệt). node eval/run.ts chạy và ghi results.md, các pipeline checks pass; 86 câu mock vẫn có 4 trường hợp chất lượng đã biết, không tuyên bố eval toàn bộ đúng. HTTP POST /api/chat với Dawn trả grounded và evidence dwn-006, mocked=true. Trong trình duyệt tích hợp VS Code: mở Dawn, xác nhận lời chào ở đầu sau sửa, nhìn chữ hiện dần và mô hình cử động, tự chuyển đến chương cuối rồi dừng, Trước về 7/Tiếp sang 8, gửi câu hỏi về ion thrusters thấy câu trả lời, Journal tăng 1, mở Sources thấy fact và liên kết NASA NSSDCA.
Chưa kiểm tra: âm thanh TTS thực tế/voice trên từng hệ điều hành, cảm ứng thật, provider LLM thật hoặc deploy. Chat hiện là mock khớp từ khóa, không phải chất lượng LLM; fact giữ pending, chương tĩnh có nhãn awaiting review ở nguồn.
Phụ thuộc còn thiếu: khóa provider và duyệt fact để bật chat thật ở chế độ strict; không cần khóa cho kể chuyện viết sẵn/TTS.
Bước tiếp theo: demo đã mở trong VS Code tại http://127.0.0.1:5173/; chọn Dawn → Story & talk, Enable voice để thử giọng đọc.

Task / Owner: Chính hiện vật là nhân vật trong một cuộc trò chuyện / Codex (2026-11-14)
File đã sửa: explorer/Storyteller.tsx, narrative.ts, index.tsx, session.ts, explorer.css; world/index.tsx, world.css; server/prompt.ts; content/facts.json, sources.json, catalog.json; eval/storyteller.check.mjs, results.md; CREDITS.md, docs/DECISIONS.md, TASKS.md.
Thay đổi: bỏ robot đại diện, tab Story & talk/Mission records/Journal, khung chương, chỉ số chương, Previous/Next và các banner lặp. Hiện vật NASA là hình nhân vật, chỉ còn header tên, speaker, transcript và ô hỏi cố định. Viết riêng lời kể ngôi thứ nhất cho 17 hiện vật (sứ mệnh, đóng góp, lời nhắn nhớ đến); Dawn có thêm một đoạn khoa học theo NASA/JPL 31/03/2016 (dwn-009, pending). Tự chào/kể nối tiếp trong cùng transcript với câu hỏi; người đọc hỏi hoặc cuộn lên thì dừng tự kể; Continue tiếp đúng đoạn, guard chống lặp/chen khi pending. Click spacecraft solar mở thẳng cuộc trò chuyện. Bỏ ảnh lặp bên cạnh GLB, credits thu gọn; ảnh NASA vẫn dùng cho hiện vật thiếu GLB, ghi chú model dùng chung vẫn giữ. Không đổi trạng thái duyệt bất kỳ fact cũ nào.
Đã kiểm tra: npm run build pass; storyteller.check pass cho 17 kịch bản ngôi thứ nhất, nguồn/cutoff/số, lời kết, transcript xen hỏi và kể, không lặp greeting, dừng khi pending và hết truyện, không mutate EMPTY_SESSION. Eval 86 câu mock chạy lại, pipeline checks pass; các lỗi chất lượng mock trước đó vẫn còn (không tuyên bố LLM thật). git diff --check exit 0. HTTP hỏi Dawn về bright spots trả grounded với dwn-009/NASA-JPL và mocked=true. UI VS Code: reload sạch, mở Dawn tự chào/kể, thấy GLB và transcript gọn không robot/tab; hỏi ion thrusters trong cùng thread trả lời ngôi thứ nhất; Continue sau câu hỏi nối tới đúng lời kết nhắc nhớ Vesta/Ceres rồi ẩn nút kể tiếp. Ô hỏi luôn ở dưới; source thu gọn.
Chưa kiểm tra: TTS âm thanh thật, mobile cảm ứng, trực tiếp bấm mọi model nhỏ trên solar, provider thật/deploy. Fact mới chưa được người thật duyệt; kịch bản biên tập và mock không phải câu trả lời LLM thật.
Phụ thuộc còn thiếu: khóa API và duyệt fact cho chat thật ở chế độ strict.
Bước tiếp theo: demo đang mở Dawn trong VS Code, có thể chọn hiện vật khác để nghe câu chuyện riêng.

Task / Owner: Lời chào truyền cảm hứng 15 giây và tàu chibi / Codex (2026-11-14)
File mới: explorer/ShuttleMascot.tsx, voice.ts. File sửa: Storyteller.tsx, narrative.ts, explorer.css, session.ts; server/prompt.ts, personas.ts; eval/storyteller.check.mjs, results.md; CREDITS.md, docs/DECISIONS.md, TASKS.md.
Thay đổi: viết lại 17 lời chào thành đúng một đoạn 38–41 từ, ngôi thứ nhất vui/gần gũi, không nhả thêm từng câu/chương. Hiển thị trọn đoạn, bỏ typewriter/Continue/timer kể tiếp. Guard ID chống lặp và thay kịch bản nhiều phần cũ khi hot reload, vẫn giữ các câu hỏi người dùng. Tàu con thoi chibi SVG ở góc nút gửi, bay nhích lên và có lửa/khói nối vào bóng chữ khi nói; nút có chữ thì gửi, trống thì replay. TTS rate 1.08, pitch 1.16, chọn trong giọng English sẵn có, hỗ trợ mute/replay, text fallback và reduced-motion. Prompt và lời dẫn mock được làm tươi sáng hơn; không thêm/sửa fact khoa học.
Đã kiểm tra: build pass; storyteller.check pass (17 đoạn duy nhất, ước lượng 13–17 giây từ số từ, ngôi thứ nhất, nguồn/cutoff/số hợp lệ, không phát thêm tự động, chống lặp, giữ câu hỏi khi thay kịch bản, chọn giọng/fallback). Eval 86 câu mock chạy, pipeline checks pass; không tuyên bố tất cả câu trả lời mock đúng hoặc đo được LLM thật. HTTP Dawn trả lời ion thrusters với opener mới, I và evidence dwn-006. VS Code preview Spirit: đúng một đoạn lời chào, tàu chibi hiện tại góc gửi; bấm replay thấy trạng thái speaking, tàu bay lên, lửa/khói và bóng thoại, không thêm message; sau đó idle và chỉ chờ câu hỏi. Gõ When did you land? rồi bấm tàu gửi được, nhận một câu trả lời có Sources và lời dẫn mới. git diff --check pass.
Chưa kiểm tra: chưa nghe/đánh giá âm thanh thực tế hoặc đo thời lượng của từng voice; 15 giây là ước lượng văn bản, biểu cảm thực tùy browser/OS. Chưa kiểm thử cảm ứng thật/provider thật/deploy; chat tự do vẫn mock, facts pending không tự duyệt.
Phụ thuộc còn thiếu: giọng TTS tùy trình duyệt; khóa API và duyệt fact cho chat LLM thật.
Bước tiếp theo: preview VS Code đang mở Spirit; bấm chibi để nghe lại hoặc nhập câu hỏi rồi bấm chibi gửi.

Task / Owner: Dừng bằng tên lửa và trang trí chat vũ trụ / Codex (2026-11-14)
File sửa: src/features/explorer/Storyteller.tsx, voice.ts, explorer.css; eval/storyteller.check.mjs; docs/DECISIONS.md, TASKS.md.
Thay đổi: tàu đang nói bấm là dừng ngay, ưu tiên hơn gửi/replay; hủy TTS/timer, cờ dừng ngăn danh sách giọng cập nhật làm tự phát lại. Tàu nghỉ có chữ thì gửi, trống thì phát lại; thêm nhãn Stop speaking, dấu dừng và hướng dẫn. Giao diện chat có nền sao/tinh vân nhẹ, hành tinh vành đai và chòm sao SVG, huy hiệu quỹ đạo, tên người kể trên bóng khói, bệ đáp; tôn trọng reduced-motion. Tham khảo https://science.nasa.gov/eyes/ và https://www.jpl.nasa.gov/deep-space-network-now/; toàn bộ họa tiết tự vẽ bằng code, không thay model hoặc dữ kiện khoa học.
Đã kiểm tra: npm run build pass; node eval/storyteller.check.mjs pass, thêm ca stop khi đang nói (kể cả có draft), send/replay khi nghỉ. Native VS Code preview Spirit: giao diện mới hiển thị, replay chuyển speaking và bay/khói; bấm chính tàu đang bay chuyển Your turn, explorer!, mất dấu dừng/khói, tàu về bệ, transcript giữ nguyên. Không đo/đánh giá âm thanh thực tế.
Chưa kiểm tra: cảm ứng/mobile thật, provider thật và deploy. Không chạy lại eval 86 câu vì không thay logic server/nội dung.
Phụ thuộc còn thiếu: API key và duyệt facts để chạy chat thật strict.
Bước tiếp theo: preview VS Code đã cập nhật trực tiếp; bấm tàu để nghe, bấm lần nữa khi đang kể để dừng.

Task / Owner: Dọn chữ quanh ô chat / Codex (2026-11-14)
File sửa: Storyteller.tsx, explorer.css, TASKS.md.
Thay đổi: theo yêu cầu trực tiếp, bỏ cả hàng Your next discovery / Tap to listen (và trạng thái Tap to stop / Ready to send) cùng dòng Story character · Demo replies ở chân chat; xóa CSS không còn dùng. Giữ chức năng gửi/nghe/dừng và nhãn truy cập của nút.
Đã kiểm tra: npm run build pass. Không kiểm tra lại UI bằng tự động hóa cho thay đổi xóa chữ nhỏ này.
Phụ thuộc: không thêm. Chat backend vẫn mock như trước; việc bỏ nhãn không đổi provider.
Bước tiếp theo: preview Vite tự cập nhật.

Task / Owner: Giọng kể nhẹ nhàng hơn / Codex (2026-11-14)
File sửa: voice.ts, Storyteller.tsx, eval/storyteller.check.mjs, TASKS.md.
Thay đổi: rate từ 1.08 xuống 0.94, pitch từ 1.16 về 1.02 gần tự nhiên, volume 0.85. Ước lượng thời gian chuyển động theo tốc độ mới (lời mở đầu khoảng 16–18 giây); không kéo dài nội dung hoặc tự kể thêm.
Đã kiểm tra: npm run build và node eval/storyteller.check.mjs pass. Chưa nghe/đánh giá âm thanh thật; sắc thái tùy giọng browser/OS.
Phụ thuộc: giữ giọng TTS có sẵn, không cần API mới.
Bước tiếp theo: bấm tàu để nghe lại với cấu hình nhẹ hơn.

Task / Owner: Nền sao tự nhiên, nhãn nhỏ và phân biệt Eros / NEAR / Codex (2026-11-14)
File mới: public/assets/images/deep-star-map-8k.jpg (NASA SVS nguyên bản, 7,200,691 bytes; SHA-256 trong assets.json). File sửa: SpaceBackdrop.tsx, SolarScene.tsx, solar-system.ts, scene-motion.ts, scene-motion.check.mjs, world/index.tsx, world.css; content/assets.json; CREDITS.md, docs/LOCATION-MOTION-AUDIT.md, docs/DECISIONS.md, TASKS.md.
Thay đổi: giữ nguyên GALAXIES và SpiralGalaxy; bỏ Stars tổng hợp, dùng sky 8192×4096 celestial NASA SVS 3895 và giảm sáng. Hiện tên đủ tám hành tinh, Mặt Trời/Mặt Trăng và tàu với chữ nhỏ hơn. Spacecraft radii 0.08–0.11 nhỏ hơn Mercury 0.22, Eros 0.16/Ceres 0.20; Dawn vẫn quay ngoài Ceres ở bán kính minh họa 0.55. Eros được đặt tên/ID riêng, click inspect Eros và nút Meet NEAR mở GLB/story tàu; không giả pose đáp trên asteroid. Không sửa dữ kiện hoặc review status.
Đã kiểm tra: npm run build pass; scene-motion.check pass, gồm đủ tám hành tinh, mọi tàu nhỏ hơn hành tinh, Dawn nằm ngoài host, Eros là target riêng, chuyển động cũ/galaxies/meteors vẫn đúng. Tải file từ URL NASA, đối chiếu size/SHA. VS Code preview: nền mới tối và bớt nhiễu, thấy nhãn các hành tinh và tên tàu nhỏ; mở Eros từ danh sách, zoom cận cảnh, bấm chính mesh đá vẫn ở Eros; bấm Meet NEAR mở đúng tàu có bốn tấm pin và chat NEAR. Hai thiên hà vẫn hiện hai góc và quay như trước.
Chưa kiểm tra: cảm ứng/mobile và tải mạng chậm cho file 8K; vị trí/kích thước/tốc độ vẫn minh họa. Provider/deploy không nằm trong lượt sửa giao diện này.
Phụ thuộc: không thêm thư viện hoặc khóa API.
Bước tiếp theo: preview đang mở NEAR; Back to Solar system để xem nền và nhãn mới.

Task / Owner: Thêm nhãn Ceres / Codex (2026-11-14)
File sửa: SolarScene.tsx, TASKS.md.
Thay đổi: thêm tên Ceres bên dưới thiên thể ở tâm vòng Dawn, dùng cùng kiểu chữ nhỏ của hành tinh; nhãn gắn với nhóm Ceres nên đi theo khi quay quanh Mặt Trời.
Đã kiểm tra: npm run build pass. Không kiểm thử UI tự động lại cho thay đổi thêm nhãn nhỏ.
Phụ thuộc: không thêm.
Bước tiếp theo: preview Vite tự cập nhật nhãn Ceres.

Task / Owner: Hover sáng hành tinh và zoom tại con trỏ / Codex (2026-11-14)
File mới: world/hover-highlight.ts, camera-navigation.ts, interaction.check.mjs. File sửa: InspectionTarget.tsx, SolarScene.tsx, CameraRig.tsx, solar-system.ts, scene-motion.check.mjs, world/index.tsx; docs/DECISIONS.md, TASKS.md.
Thay đổi: mọi Inspectable ở solar có vùng bấm/hover thống nhất, cursor zoom-in, bề mặt sáng nhẹ và viền cyan khi rê chuột; dùng clone material rồi restore/dispose khi rê ra để không ảnh hưởng các model dùng chung. Không đổi geometry hay texture. Bỏ các Pickable con trước đây chặn hover Moon/Mars/tàu. Ceres cũng hover/inspect được và có nút Meet Dawn. Bật dollyToCursor; đồng bộ virtual viewport theo view offset của camera khi có chat; bám thiên thể bằng cộng chuyển động thay vì reset tâm, giữ phần zoom lệch tâm do người dùng chọn. Đối chiếu API chính thức https://github.com/yomotsu/camera-controls và mã phiên bản đang cài.
Đã kiểm tra: npm run build pass; interaction.check pass (material NASA dùng chung không bị sửa, geometry/texture giữ nguyên, restore/dispose đúng và không hoàn tác texture mới tải; zoom in/out giữ điểm con trỏ sai lệch dưới 1px trong mô hình kiểm tra, ba layout gồm desktop/mobile có chat; tracking giữ offset zoom). scene-motion.check pass sau khi thêm Ceres. UI native VS Code: sao Mộc sáng/viền khi trỏ vào, ra ngoài trở lại màu gốc; zoom ở vùng lệch tâm làm hành tinh lớn lên theo vùng con trỏ, không kéo về giữa; camera vẫn theo chuyển động hành tinh.
Chưa kiểm tra: cảm ứng/pinch trên máy thật, toàn bộ tám hành tinh lần lượt bằng tay, provider/deploy. Không chạy lại eval chat vì không sửa server/nội dung.
Phụ thuộc: không thêm thư viện/API key.
Bước tiếp theo: preview VS Code đã cập nhật; rê hành tinh rồi cuộn để xem cận cảnh tại con trỏ.

Task / Owner: Nền Ngân Hà quang học chân thật hơn / Codex (2026-11-14)
File mới: world/sky-background.ts, sky-background.check.mjs; public/assets/images/milky-way-panorama.jpg (2000×1000, 226158 bytes), deep-star-map-galactic-8k.jpg (8192×4096, 6975942 bytes). File sửa: SpaceBackdrop.tsx, parts.tsx, world/index.tsx, content/assets.json, CREDITS.md, docs/LOCATION-MOTION-AUDIT.md, docs/DECISIONS.md, TASKS.md.
Thay đổi: dùng mosaic ảnh quang học toàn trời © Axel Mellinger được NASA APOD công bố ngày 25/11/2009 cho mây sao/dải bụi, phối sao sáng nét từ bản đồ NASA SVS 8K cùng hệ galactic. Remap ảnh Hammer-Aitoff sang UV sphere, tránh kéo cả khung oval/chữ thành nền. Render giảm exposure/black point, decode sRGB chủ động một lần. Hook texture thêm tham số colorSpace tùy chọn, mặc định sRGB cũ cho mọi hành tinh. Sky giữ hướng world và chỉ đi theo vị trí camera để không có parallax giả; hai thiên hà particle, meteors, hành tinh và hover/zoom giữ nguyên. File ảnh nguyên bản NASA-hosted, hash/size được ghi trong assets.json; ảnh quang học có bản quyền tác giả riêng, không tự nhận NASA sở hữu/public-domain; credit nhỏ ở cảnh và CREDITS.
Đã kiểm tra: build pass; sky-background.check pass (round-trip projection độc lập, cực/biên, toàn bộ vertex nằm trong ellipse ảnh); scene-motion.check và interaction.check pass. Hai asset size/SHA-256 khớp. UI native VS Code: ảnh bụi/mây sao có mặt trong overview và focus Jupiter, giảm sáng sau khi xem thử để không át hành tinh; kéo xoay thấy nền liền ở góc đã kiểm tra, không có khung oval/caption trong trời; hai thiên hà cũ vẫn xuất hiện, trở về overview qua Sun/Back. git diff --check pass.
Chưa kiểm tra: thiết bị yếu/mobile thật hoặc tải mạng chậm; ảnh quang học chỉ 2K, chi tiết sao bổ sung là bản đồ catalog 8K chứ không phải ảnh chụp 8K. Nền là phối cảnh trang trí theo ảnh thiên văn, không phải bầu trời thời gian thực từ tàu. Provider/deploy không thuộc lượt này.
Phụ thuộc: không thêm thư viện/khóa API.
Bước tiếp theo: preview VS Code đang ở tổng quan với nền mới.

Task / Owner: Bỏ chữ đậm ở nhãn hành tinh / Codex (2026-11-14)
File sửa: world.css, TASKS.md.
Thay đổi: đặt font-weight 400 cho nhãn bản đồ; strong trong nhãn kế thừa độ đậm thường, giữ cỡ chữ và vị trí.
Đã kiểm tra: npm run build pass. Không thêm test cho thay đổi CSS nhỏ.
Phụ thuộc: không thêm.
Bước tiếp theo: preview Vite tự cập nhật.

Task / Owner: Thay tầng surface:mars bằng bản đồ 6 thiết bị từ Nasa_Space_Apps_Challenge-main / Claude Code (2026-11-14)
File mới: mars-missions/ (index.html, mars-missions.js, mars-missions-data.js, mars-mission-replay.js, mars-lander-operations.js, mars-site-terrain.js, mars-surface-effects.js, mars-missions.css, insight-poses.json, LICENSE, THREE-LICENSE, chép từ Nasa_Space_Apps_Challenge-main); public/mars-assets/ (ingenuity.glb, insight.glb, insight-deployed.glb, mer-articulated.glb, viking.glb, mars.jpg, draco/); src/features/explorer/MarsMissionsFrame.tsx. File sửa: vite.config.ts (input thứ hai marsMissions), src/features/explorer/index.tsx, explorer.css, src/features/world/index.tsx, docs/DECISIONS.md, TASKS.md.
Thay đổi: bấm Mars mở quả cầu Sao Hỏa có 6 thiết bị (Ingenuity, Opportunity, Spirit, InSight, Viking 1, Viking 2), nhúng bằng iframe cùng origin dưới thanh trên của app. Bên trong iframe vẫn có bay tới địa điểm, mô hình 3D, hành trình nhiệm vụ. Mỗi thiết bị có thêm nút "Nghe … kể chuyện →": postMessage về app chính, mở thẻ hiện vật + chat đúng ID trong catalog; Back trả về bản đồ, mở lại đúng thiết bị (?mission=<id>). World không vẽ canvas R3F ở tầng này. Thêm nhãn "Not to scale". Bỏ trang Dingo Gap (cần thêm dependency 3d-tiles-renderer).
Đã kiểm tra: tsc -b pass; npm run build pass, sinh dist/mars-missions/index.html và chép dist/mars-assets. Dev server trả 200 cho /mars-missions/, ?mission=opportunity, các module JS, insight-poses.json, mars.jpg, viking.glb, draco_decoder.wasm.
Chưa kiểm tra: chưa mở trình duyệt thật (ổ C còn 0 MB, Vite sập vì thiếu bộ nhớ, không cài được Playwright). Chưa thử bấm nút kể chuyện, Back, mobile. Sojourner và Phoenix vẫn có thẻ trong catalog nhưng không có chấm trên bản đồ mới (bản đồ chỉ có 6 thiết bị). Asset mới chưa ghi sha256 vào content/assets.json.
Phụ thuộc: không thêm thư viện (three đã có, dùng 0.187 thay vì 0.185.1 của bản gốc).
Bước tiếp theo: giải phóng ổ C, chạy npm run dev, bấm Mars → chọn một thiết bị → "Nghe … kể chuyện" → Back.

Task / Owner: Bản đồ Sao Hỏa chuyển sang tiếng Anh + tên luôn hiện cạnh chấm / Claude Code (2026-11-14)
File sửa: mars-missions/index.html, mars-missions.js, mars-missions-data.js, mars-mission-replay.js, mars-site-terrain.js, mars-missions.css, TASKS.md.
Thay đổi: dịch toàn bộ chữ hiển thị, aria-label, tóm tắt, mốc hành trình, ghi chú địa hình sang tiếng Anh đơn giản; type đổi thành Helicopter/Rover/Lander (replay so khớp theo giá trị này). Opportunity ghi cả hai mốc 10/06/2018 và 13/02/2019; vị trí Ingenuity ghi rõ "not its deployment site". Nhãn tên luôn hiện dưới mỗi chấm vàng, hover/focus thì đổi sang nền vàng.
Đã kiểm tra: không còn ký tự tiếng Việt trong mars-missions/*.js|html|css; tsc -b và npm run build pass; dev server trả trang có lang="en", <h1>Mars</h1>.
Chưa kiểm tra: chưa nhìn bằng mắt các nhãn có chồng nhau khi hai chấm gần nhau (InSight và Viking 2 cùng kinh độ ~135°E).

Task / Owner: Màn hình thiết bị Sao Hỏa: tự chạy hoạt cảnh, một màn hình không cuộn, chat kể chuyện ngôi thứ nhất / Claude Code (2026-11-14)
File mới: mars-missions/mars-chat.js. File sửa: mars-missions/index.html, mars-missions.js, mars-mission-replay.js, mars-missions.css, TASKS.md.
Thay đổi: mô hình tải xong là replay.autoplay() chạy lần lượt các mốc; nút nhỏ "↺ Replay" chạy lại từ mốc 1, nút Ⅱ/▶ tạm dừng/tiếp. Bố cục mission: cảnh 3D trái, cột phải gồm tóm tắt (3 dòng), hành trình gọn, khung chat chiếm phần còn lại, "Model & sources" thu gọn; html/body overflow hidden, chỉ log chat cuộn bên trong. Màn hẹp/thấp ẩn tóm tắt, danh sách mốc và ghi chú AI. Chat: lời mở đầu từ narrative.ts › buildNarrative (gắn fact id NASA), 3 câu gợi ý, câu hỏi gửi POST /api/chat (cùng pipeline grounded của app chính), hiện nhãn "Demo answer (no real AI yet)" khi mocked và link nguồn từ evidence. Nút "Full story card →" vẫn mở thẻ đầy đủ.
Đã kiểm tra (Playwright + Chromium swiftshader, dev server): 1366×768 qua app chính (Mars → Viking 2), 390×690 và 1280×560 mở thẳng ?mission=: scrollHeight trang và aside bằng clientHeight; hoạt cảnh tự sang mốc 2 sau ~7 s không cần bấm; Replay đưa về mốc 1; chip câu hỏi gửi được và trả lời mock có nhãn; không có lỗi console/pageerror. tsc -b, npm run build pass.
Chưa kiểm tra: LLM thật (chưa có khóa, mock trả "not in my mission records" cho Viking 2 vì fixture chưa có câu đó); thiết bị cảm ứng thật; giảm chuyển động (reduced motion) với autoplay.
Phụ thuộc: không thêm thư viện.

Task / Owner: Nút Run cạnh Reset view + chat thành tên lửa chibi bật ra cửa sổ / Claude Code (2026-11-14)
File sửa: mars-missions/index.html, mars-chat.js, mars-missions.js, mars-missions.css, TASKS.md.
Thay đổi: nút "▶ Run" (chạy lại hoạt cảnh từ mốc 1) nằm cạnh Reset view ở chân cảnh, chỉ hiện ở màn thiết bị; bỏ ↺ Replay ở cột phải. Bỏ chữ "Not to scale" cạnh Reset view theo yêu cầu, chuyển vào dòng hướng dẫn "Drag to rotate · Scroll to zoom · Not to scale" để vẫn giữ luật CLAUDE.md số 6. Khung chat rời khỏi cột phải: tên lửa chibi (cùng SVG với ShuttleMascot của app chính) ở góc dưới phải cảnh, có bóng thoại "Talk with me!", bấm vào bật cửa sổ chat; nút × hoặc Esc để đóng; tên lửa phun lửa khi đang chờ trả lời. Màn ≤760px: cửa sổ chat phủ toàn màn hình. Reduced motion tắt animation.
Đã kiểm tra (Playwright, 1600×860 và 390×690): trang không cuộn; Run đưa về mốc 1; tên lửa mở/đóng chat; chip câu hỏi gửi và nhận trả lời mock có nhãn; không có lỗi JS (chỉ 404 favicon). tsc -b, npm run build pass.
Chưa kiểm tra: LLM thật, chạm trên điện thoại thật.

Task / Owner: Bỏ trang thẻ hiện vật cho thiết bị Sao Hỏa, chat chỉ nằm trong bản đồ Sao Hỏa / Claude Code (2026-11-14)
File sửa: mars-missions/index.html, mars-chat.js, mars-missions.js, mars-missions.css; src/features/explorer/MarsMissionsFrame.tsx, src/features/explorer/index.tsx; docs/DECISIONS.md, TASKS.md.
Thay đổi: bỏ nút "Full story card →", postMessage và deep-link quay lại; MarsMissionsFrame chỉ còn iframe. Cửa sổ chat tên lửa có nút loa đọc to (speechSynthesis, chọn giọng bằng voice.ts › chooseFriendlyVoice, cùng rate/pitch), bật mặc định nếu trình duyệt hỗ trợ: đọc lời giới thiệu khi bấm tên lửa lần đầu, đọc mỗi câu trả lời; đóng cửa sổ, gửi câu mới hoặc tắt loa thì dừng. Tên lửa phun lửa khi đang đọc.
Đã kiểm tra (Playwright 1600×900, qua app chính): Mars → Ingenuity → bấm tên lửa: không còn nút Full story card, breadcrumb vẫn "Solar system → Mars", nút loa bật/tắt đổi aria-label; không lỗi JS. tsc -b, npm run build pass.
Chưa kiểm tra: nghe giọng đọc thật (headless không phát âm thanh). Thẻ hiện vật của Sojourner/Phoenix (Sao Hỏa) và các hiện vật Mặt Trăng/deep-space vẫn dùng trang artifact cũ; Sojourner/Phoenix hiện không có đường vào.

Task / Owner: Bật chat thật với OpenAI / Claude Code (2026-11-14)
File sửa: server/llm.ts (callOpenAi gửi reasoning_effort: 'minimal' cho gpt-5 / gpt-5-mini / gpt-5-nano), TASKS.md. Người dùng tự đặt LLM_PROVIDER=openai và LLM_API_KEY trong .env (không ghi vào repo).
Lý do: gpt-5-mini với effort mặc định vượt timeout 20 s trên prompt đầy đủ (status "unavailable"); gọi thẳng API đo được 5.3 s cho câu ngắn mặc định, 1.7 s với minimal.
Đã kiểm tra: tsc -b pass; POST /api/chat qua dev server trả status "grounded", mocked:false, kèm fact id, khoảng 2 s mỗi câu (ingenuity, viking-2, opportunity).
Chưa kiểm tra: chạy lại eval/run.ts với provider thật; deploy Vercel (cần thêm LLM_PROVIDER, LLM_API_KEY vào Environment Variables).

Task / Owner: Màn thiết bị Sao Hỏa toàn màn hình, tự kể chuyện, giọng theo nhân vật, hành trình 7 s / Claude Code (2026-11-14)
File mới: mars-missions/mars-voices.js. File sửa: mars-missions/index.html, mars-missions.js, mars-mission-replay.js, mars-chat.js, mars-missions.css, TASKS.md.
Thay đổi: ở màn thiết bị bỏ cột phải (chỉ còn ở màn quả cầu cho danh sách 6 thiết bị); cảnh 3D phủ toàn bộ. Dưới tên hiện "loại · địa điểm · loại vị trí" (giữ luật 2 cho Ingenuity). Danh sách mốc thành thanh phụ đề góc dưới trái (▶/Ⅱ, ←, →, mốc + mô tả). Bỏ các nút số 1 2 3 trong cảnh; toàn bộ hành trình tự chạy trong ~7 s (JOURNEY_MS chia đều cho số mốc, chuyển động rút ngắn cho vừa). Bấm thiết bị là chat.narrate(): đọc to lời giới thiệu ngôi thứ nhất (narrative.ts) kèm bóng thoại chữ, nút ■ để dừng; không có giọng thì giữ chữ theo thời gian đọc ước tính. Giọng đọc theo nhân vật (mars-voices.js): Ingenuity cao/nhanh (Ana, Ava, Aria…), Opportunity ấm (Jenny, Michelle…), Spirit giọng Anh để khác chị em song sinh (Sonia, Libby…), InSight điềm tĩnh (Andrew, Christopher…), Viking 1/2 trầm chậm (Davis, Roger… / Ryan, Eric…); chỉ chọn trong giọng trình duyệt có, ưu tiên giọng Natural, rơi về chooseFriendlyVoice. "Model & sources" thành popover ở chân cảnh.
Đã kiểm tra (Playwright): 1600×860 qua app chính (Spirit) và 390×760 (InSight): không còn cột phải, 0 nút số, trang không cuộn, mốc 1→3 trong 1.6–6.8 s (InSight 4 mốc 1.7–7.6 s), bóng thoại kể chuyện hiện ngay; không lỗi JS. npm run build pass.
Chưa kiểm tra: nghe giọng thật (Chromium headless không có giọng đọc); giọng thực tế phụ thuộc trình duyệt/OS (Edge có nhiều giọng Natural nhất).

Task / Owner: Thiết kế lại cửa sổ chat Sao Hỏa theo phong cách vũ trụ / Claude Code (2026-11-14)
File sửa: mars-missions/index.html, mars-chat.js, mars-missions.js, mars-missions.css, TASKS.md.
Thay đổi: nền không gian sâu (sao CSS, tinh vân tím/đỏ, hành tinh có vành mờ ở góc); đầu cửa sổ kiểu kênh liên lạc: avatar hành tinh, tên thiết bị (Space Grotesk), dòng trạng thái "Signal from <site>" / "Receiving signal…" / "Transmitting from <site>" có chấm sáng; nút loa và đóng tròn cùng hàng (sửa lỗi xếp chồng do mất rule .chat-head). Tin nhắn dạng nhật ký: tàu có vạch tín hiệu xanh + nhãn tên, người dùng là thẻ đỏ Mars "You · Earth"; nguồn là pill nhỏ; câu gợi ý có chấm hành tinh; ô nhập dạng viên nang, nút gửi hình cầu. Giữ ghi chú AI (không phải tàu thật, không suy nghĩ/cảm xúc) và nhãn Demo khi mocked.
Đã kiểm tra (Playwright 1600×860, 390×760, OpenAI thật): trạng thái đổi khi chờ/đọc, trả lời grounded có nguồn, không lỗi JS; build pass.
Ghi chú: ảnh người dùng gửi hiển thị tiếng Việt do trình duyệt tự dịch trang; app vẫn là tiếng Anh.

Task / Owner: Hoạt cảnh Sao Hỏa 10 s, camera góc rộng cố định / Claude Code (2026-11-14)
File sửa: mars-missions/mars-mission-replay.js (JOURNEY_MS = 10000; bỏ toàn bộ lerp camera/target trong animate, bỏ views/flightOverview/flightFocus), mars-missions/mars-missions.js (reset(): một góc rộng cố định cho mỗi thiết bị: rover framing ≥1.35, Ingenuity 1.05, lander ≥0.9; camera (4.3, 2.4, 5.1)×framing, target lùi z −0.45 cho thiết bị di chuyển; maxDistance ≥16), TASKS.md.
Đã kiểm tra (Playwright 1600×860): Opportunity/Ingenuity 3 mốc chuyển ở ~0.3/3.7/7.2 s, kết thúc ~10 s; ảnh chụp giữa và cuối có nền đứng yên, chỉ xe/trực thăng di chuyển, luôn trong khung; không lỗi JS; build pass.

Task / Owner: Mặt Trăng dùng bản đồ nhiệm vụ như Sao Hỏa (từ Nasa_Space_Apps_Challenge-moon) + bỏ ghi chú tầng solar / Claude Code (2026-11-14)
File mới: moon-missions/ (index.html, moon-missions.js, moon-missions-data.js [dịch sang tiếng Anh, thêm artifactId], moon-mission-replay.js, moon-models.js, moon-site-terrain.js, moon-surface-effects.js, LICENSE, THREE-LICENSE); public/moon-assets/ (eagle-nassp.glb, lrv-oldschool.glb, alsep-nassp.glb, surveyor-nassp.glb, moon.jpg). File sửa: mars-missions/mars-chat.js (createChat({ body, place, siteOf }), tra artifact theo mission.artifactId), mars-missions/mars-voices.js (giọng cho 4 hiện vật Mặt Trăng), mars-missions/mars-missions.css (nhãn chấm marker--left/right), src/features/explorer/MarsMissionsFrame.tsx (nhận body), src/features/explorer/index.tsx (Guidance chỉ còn ở solar), src/features/world/index.tsx (mọi tầng surface do iframe đảm nhận; bỏ nhánh SurfaceScene; bỏ dòng ghi chú solar), vite.config.ts (input moonMissions), docs/DECISIONS.md, CREDITS.md, TASKS.md.
Giống Sao Hỏa: tiếng Anh, tên luôn hiện cạnh chấm, màn thiết bị toàn màn hình, dòng loại vị trí dưới tên, phụ đề mốc, ▶ Run, hành trình ~10 s, camera góc rộng cố định (xe LRV dùng toàn cảnh tuyến đường), tự kể chuyện + giọng nhân vật, tên lửa chibi chat (OpenAI thật). Dùng chung CSS và chat của mars-missions; Draco dùng /mars-assets/draco (giống hệt từng byte).
Đã kiểm tra (Playwright 1600×860): app chính Solar → Moon hiện bản đồ 4 chấm có tên; Eagle, Apollo 15 Rover, ALSEP, Surveyor 3 đều tải mô hình, chạy 3 mốc trong ~10 s, hiện lời kể; chat LRV trả lời grounded có nguồn NSSDCA; không lỗi JS/HTTP; dòng ghi chú solar không còn. tsc -b, npm run build pass.
Chưa kiểm tra: nghe giọng thật; điện thoại thật. Mô hình Mặt Trăng KHÔNG phải của NASA (xem DECISIONS 40), chưa ghi sha256 vào content/assets.json.

Task / Owner: Legacy Voyage — người xem làm phi hành gia trên UFO "Echo", nghe các thiết bị kể chuyện / Claude Code (2026-11-14)
File mới: src/features/voyage/ (script.ts, Voyage.tsx, voices.ts, voyage.css). File sửa: src/App.tsx (state { plan, stop } → ViewState; không thêm level mới), src/shared/app-types.ts (VoyageTour, prop tùy chọn tour cho World/Explorer), src/features/world/index.tsx (camera bám tour.focus, ẩn NavList/focusbar khi bay), src/features/world/world.css (thanh focus thành dải HUD liền, góc vát), src/features/explorer/index.tsx + MarsMissionsFrame.tsx (?tour=1&mission=), mars-missions/ + moon-missions/ (chế độ tour: ẩn UI riêng, không tự đọc, đẩy khung hình lên), mars-missions/mars-voices.js (re-export voices.ts), mars-missions/mars-chat.js (dừng giọng khi pagehide, chờ 90 ms sau cancel trước khi speak, vé speechTicket), mars-missions/mars-missions.css (.is-tour), TASKS.md, docs/DECISIONS.md.
Nội dung: 3 chuyến bay riêng (Mặt Trăng 4 thiết bị, Sao Hỏa 7, không gian sâu 4; mỗi chuyến có chặng cất cánh và về nhà) + bay lẻ tới từng thiết bị (1 chặng). Echo (người dẫn) nối các mốc "máy trước mở đường cho máy sau"; mỗi thiết bị nói ngôi thứ nhất bằng giọng riêng. 53 lượt trích fact, mọi câu nêu dữ kiện gắn fact id, ≤4 câu/lượt. Mỗi thiết bị trao một "Legacy Spark"; chặng cuối hiện bảng Sparks. Buồng lái: kính chắn trong suốt (cảnh 3D vẫn tương tác), bản đồ hành trình, hiệu ứng warp khi đổi thế giới, Next/Back/Again/Autopilot/Voice, link nguồn NASA, ghi chú "Pretend UFO · real machines · not to scale" và "machine voices are AI storytellers". Nút "Board the UFO" ở đỉnh màn solar mở bảng chọn chuyến.
Âm thanh: chỉ một giọng tại một thời điểm — trước mỗi câu hushEverywhere() hủy giọng ở trang chính và mọi iframe cùng origin, chờ 120 ms rồi mới speak; mỗi lượt có token, lượt cũ không đọc tiếp; trang bản đồ tự dừng khi pagehide.
Đã kiểm tra (Playwright 1600×900, dev server): bộ giả lập speechSynthesis dùng chung cho trang và iframe đếm chồng giọng — kịch bản mở Spirit (iframe đang đọc) → về solar → lên UFO → bấm Next liên tục → bay lẻ Eagle: 0 lần chồng (cả khi engine giả không tự dừng lúc pagehide). Chuyến Sao Hỏa 9 chặng, bay lẻ 1 chặng + "Land the UFO", warp chỉ khi đổi thế giới, autopilot tự sang chặng, thanh focus không chồng nút UFO; check-voyage: 53 fact id tồn tại, speaker hợp lệ. tsc -b, build pass.
Chưa kiểm tra: giọng thật trên Edge/Chrome thật; điện thoại thật. Fact dùng đều đang "pending" (cần ALLOW_PENDING_FACTS hoặc người duyệt).

Task / Owner: Giãn hệ hành tinh, Echo bay thật trong cảnh và nền HDR / Codex (2026-11-14)

Thay đổi: solar-layout.ts dùng chung tám bán kính quỹ đạo, gồm vùng vệ tinh/vành; scene-motion.ts tách Ceres/Dawn, Eros và mặt phẳng Kepler; layout.ts/CameraRig.tsx vừa khung perspective và đích Pioneer đang ra xa. App.tsx + World + Voyage.tsx điều phối SolarFlight: UFO 3D hiện trên hệ Mặt Trời, bay tới đích đang chuyển động rồi mới mở view/chặng kể; hủy không chuyển cảnh, flight ID chặn callback cũ, giữ autopilot qua chuyến bay. UfoNavigator.tsx/ufo-flight.ts dựng Echo giả tưởng và vệt bay. app-types.ts thêm prop tùy chọn, contracts.ts không đổi. Briefing thu gọn mặc định; launcher nhỏ trên preview hẹp.

Nền: use-hdr-sky.ts/SpaceBackdrop.tsx tải NASA/Gaia HDR 4096×2048 EXR bất đồng bộ (~40.6 MB), JPEG cũ làm fallback; giữ nguyên hai thiên hà quay và hướng sky world-space. BlackHoleBackdrop.tsx hiển thị video mô phỏng NASA có poster/reduced-motion fallback; không đặt hố đen trong hệ Mặt Trời hoặc tuyên bố app tự tính lensing. Ba media gốc mới ở public/assets/{images,video}; nguồn/kích thước/SHA256 trong content/assets.json.backgroundMedia và CREDITS.md. File nguồn không chỉnh sửa.

Fact: shared/fact-policy.ts dùng chung server/chat.ts và thẻ fact. Theo chỉ dẫn người dùng, 256 fact hiện có nguồn NASA đầy đủ được phép dùng mà không cần người duyệt riêng; không đổi reviewStatus thành approved, vẫn lọc memoryCutoff và kiểm chứng evidence. .env.example và eval/run.ts cập nhật chính sách; không đổi khóa API/provider đang dùng trong .env. DECISIONS 43–45 và LOCATION-MOTION-AUDIT ghi giới hạn hiển thị.

Đã kiểm tra: npm run build pass; solar-layout.check.mjs (khoảng hở toàn bộ vệ tinh/vành ở mọi pha, khung desktop/mobile, đích UFO chuyển động), scene-motion.check.mjs, interaction.check.mjs (hover/zoom con trỏ), sky-background.check.mjs, eval/fact-policy.check.mjs và eval/storyteller.check.mjs đều pass. Kiểm tra UI native trong preview VS Code: chọn bay lẻ Surveyor 3, thấy nền/hố đen và HUD Echo in flight trên hệ Mặt Trời, tới nơi mở đúng moon-missions/?tour=1&mission=surveyor-3 rồi hiện câu chuyện/cockpit. Không dùng giả lập trình duyệt cho lượt này.

Eval 86 câu được chạy riêng với LLM_PROVIDER=mock: cả chế độ mặc định và allow-pending đạt 41/42 grounded-correct, 41/44 refusal-correct, evidence 86/86; bốn lỗi matcher cũ sv3-q07, sv3-q23, vk1-q18, vk1-q23 còn nguyên, chi tiết trong eval/results.md. Đây không phải điểm chất lượng LLM thật.

Chưa kiểm tra: mọi tổ hợp tour/cancel bằng UI, chất lượng nghe giọng thật, thiết bị di động thật, hiệu năng HDR trên GPU yếu, deploy Vercel và provider LLM thật trong lượt này. Kiểm tra khung mobile là phép chiếu Three.js, không thay thế thử trên điện thoại. Hình vẫn có thể che nhau trong phối cảnh dù mesh không va chạm. Bước tiếp theo nếu cần: thử tour dài và mạng chậm/GPU yếu; JPEG fallback đã có để không chờ EXR mới hiện cảnh.

Task / Owner: Điểm ngắm nền quanh 360° / Codex (2026-11-14)

Theo yêu cầu thêm ít: scene-motion.ts giữ hai thiên hà cũ, thêm hai thiên hà nhỏ phía sau và cấu hình hai hố đen (chỉ thêm một). BlackHoleBackdrop.tsx vẽ hai vị trí cố định hướng vào hệ, dùng chung một video/texture NASA và poster, không thêm file tải xuống hoặc decoder. Tổng 4 thiên hà/2 hố đen; không gắn với hướng camera và không đổi fact/quỹ đạo/UFO.

Đã kiểm tra: npm run build pass; scene-motion.check.mjs pass, gồm phép chiếu camera xoay mỗi 15° đủ 360°, thấy được cả sáu điểm; hai thiên hà mới ngoài góc nhìn đầu, mọi điểm cách xa vùng hành tinh. CREDITS và DECISIONS 46 cập nhật. Chưa bấm xoay thử bằng UI/điện thoại hoặc đo FPS trong lượt này. Cách xem: ở Solar system kéo chuột để quay quanh hệ và thấy thêm phía sau/bên hông.

Task / Owner: UFO kim loại và đồng nhất mô hình/điểm đến Mars / Codex (2026-11-14)

File tạo/sửa: EchoCraft.tsx, UfoNavigator.tsx, Voyage.tsx/script.ts, MarsMissionsFrame.tsx; mars-missions-data.js, mars-mission-media.js, mars-missions.js/css; eval/mars-route.check.mjs; content/assets.json.externalViewers, CREDITS, DECISIONS 47–48 và TASKS. Không sửa contracts, dependency hoặc khóa API.

Echo thay sphere bóng bằng thân tiện kim loại có vân roughness, seam/bolt, viền tối và 3 nozzle; phản xạ RoomEnvironment chỉ áp dụng cho Echo, SVG cockpit/launcher theo cùng thiết kế. Hai đường vào Mars dùng cùng 8 thiết bị: thêm Sojourner/Phoenix, Spirit thành chặng riêng; Sojourner/Phoenix mở đúng mission thay vì ảnh ở cockpit và globe chung. Sáu thiết bị cũ giữ GLB/hoạt cảnh. Sojourner dùng chính viewer Sketchfab người dùng gửi (Jan Walter Sluka, không phải NASA); public API báo isDownloadable=false/Standard, không có archive, nên không copy/trích xuất model. Đã nhúng công khai, cần mạng. Phoenix có ảnh NASA/câu chuyện/chat nhưng CHƯA có local 3D model; không thay bằng InSight. Nút replay/reset và thông số kích thước không áp dụng được ẩn cho media ngoài/ảnh.

Đã kiểm tra: build pass; mars-route.check đối chiếu đầy đủ 8 ID giữa catalog/map/quick-hop/world-tour, mỗi tour mission đúng ID, mọi GLB/terrain/photo/fact tham chiếu tồn tại. UI native VS Code: mở trực tiếp Sojourner, thấy đúng mô hình Sketchfab; Back về globe có đủ 8 mục, chọn Phoenix thấy đúng ảnh/câu chuyện; từ Solar Board the UFO → Sojourner, thấy Echo in flight → iframe ?tour=1&mission=sojourner, cùng mô hình Sojourner hiện trong cockpit và lời kể. Kiểm tra lại build/check sau các chỉnh text/ẩn control cuối.

Chưa kiểm tra: replay của từng GLB cũ trong lượt này, chặng Spirit/Phoenix bằng tour UI, mạng offline/điện thoại thật, cảm nhận giọng và FPS trên GPU yếu. Sojourner là viewer 3D ngoài, không tham gia replay di chuyển trên địa hình của app. Muốn tích hợp như GLB cục bộ/offline cần file được cấp quyền sử dụng từ tác giả. Mẫu link này không cho tải; nguồn/metadata ghi rõ trong assets.json và CREDITS. Không cần người duyệt fact NASA theo chính sách đã chốt.

Task / Owner: Thử đồng nhất nền Sojourner / Codex (2026-11-14) — CHƯA HOÀN THÀNH

Đã thử Viewer API chính thức của Sketchfab (transparent background + camera sync) cùng địa hình Mars dùng chung. Build/test chạy nhưng kiểm tra Chrome thấy vùng trắng và mô hình không hiển thị đúng; đã hoàn lại toàn bộ phần ghép thử nghiệm, xóa diagnostic và module thử, giữ viewer nhúng trước đó. Không đánh dấu yêu cầu nền giống hệt là xong. Không trích xuất file từ viewer hay thay rover bằng model khác. Bản model được chỉ định hiện không cho tải; cần GLB/GLTF được cấp quyền sử dụng để tích hợp đầy đủ với địa hình/ánh sáng/camera/hoạt cảnh gốc. Computer Use bị dừng do không xác định chắc URL trình duyệt, không tiếp tục điều khiển UI sau thông báo đó. Build và mars-route.check được chạy lại sau hoàn nguyên.

Task / Owner: Bay từ trong buồng lái + phần thưởng khám phá / Codex (2026-11-15)

Camera: UfoNavigator điều khiển CameraControls eye/target theo đường bay và đích di chuyển; CameraRig tạm nhường quyền và khóa thao tác camera trong chuyến bay. ufo-flight.ts thêm cockpitDock tránh trục nhìn thẳng đứng, standoff ngoài mesh; bay 6 s, reduced motion giữ 0.25 s. FlightCockpit.tsx/world.css vẽ kính, HUD, tiến độ và nút hủy chung cho cả global/local flight. App/World/app-types nối onFlightCancel; bỏ HUD nhìn ngoài cũ. Giữ Echo khi nghỉ, các đường đi/view có sẵn và cập nhật vị trí vật thể. contracts.ts không đổi. Unit kiểm tra eye nằm ngoài đích và đích ở tâm projection qua nhiều điểm đường bay.

Reward: tạo features/rewards/{rewards.ts,reward-ui.ts,PassportButton.tsx,rewards.css}; 17 huy hiệu, hiệu ứng vũ trụ, bảng hộ chiếu, progress localStorage và fallback khi quota/blocked storage. Chỉ nhận khi người xem chọn Save; replay không nhân đôi. Gắn vào Voyage, Explorer header/Storyteller và mars-chat dùng chung cho Moon/Mars. Chặng tour kết thúc mở phần thưởng, autopilot chờ tới khi đóng; ngừng tính chặng bị bỏ qua là đã sưu tập. Tắt voice giữa chặng vẫn tiếp tục ở tốc độ đọc thay vì treo. Tự khám phá có Finish discovery; Moon/Mars đề nghị thưởng sau lời kể hoặc bấm Finish. Không đổi nội dung fact/API/provider.

Đã kiểm tra: npm run build; eval/rewards.check.mjs (đủ 17 ID, không tự nhận khi mở, không nhận trùng, lưu/khôi phục, nhiều document, JSON lỗi, ID giả, storage bị chặn); eval/mars-route.check.mjs; world/solar-layout.check.mjs (cả hình học góc nhìn buồng lái); world/interaction.check.mjs — pass. Chưa kiểm tra UI thực tế/âm thanh/thời gian chuyển cảnh/autopilot bằng trình duyệt trong lượt này: VS Code đang thu nhỏ; Computer Use dừng khi chọn Chrome do không xác định chắc URL trên Windows, không tiếp tục thao tác sau đó. Không tuyên bố đã QA hình ảnh. Bước tiếp theo: mở preview, thử bay Mars/Moon/hủy, nghe hết một chặng, Save badge, mở Passport và tải lại kiểm tra tiến độ. Nền Sojourner vẫn là bản nhúng trước đó, yêu cầu nền giống hệt còn chờ model được cấp quyền.

Task / Owner: Mở web là Echo dẫn chuyện; ba chuyến bay nối thành một câu chuyện / Claude Code (2026-11-15)
File sửa: src/features/voyage/Voyage.tsx (VoyageIntro, finishedChapters/markChapterFinished, nút "Next chapter"), script.ts (nextChapter, câu kết Moon/Mars dẫn sang chương sau), voyage.css (.vy-intro), src/App.tsx (state intro, startPlan, onNextChapter), vite.config.ts (resolve.dedupe + optimizeDeps.include cho three), TASKS.md.
Thay đổi: mở trang là UFO Echo bay vào, nêu đề bài "Abandoned, but not forgotten" và ba chương (Moon → Mars → Deep space); "Start the story" bay chương đầu chưa xong, "Choose a flight" mở bảng chọn, "Explore on my own" đóng. Cuối mỗi chuyến, nút chính là "Next chapter: … ▶"; chương đã xong lưu trong localStorage nên lần sau Echo chào "Welcome back" và đề nghị "Continue: Mars ▶". Không thêm fact mới.
Sửa lỗi dev: Vite nạp hai bản three.js (canvas sập với "Cannot assign to read only property 'quaternion'", chuyến bay không bao giờ tới nơi). Khai báo optimizeDeps.include + dedupe; nếu gặp lại: dừng server, xóa node_modules/.vite, chạy lại npm run dev.
Đã kiểm tra (Playwright 1600×900): intro hiện khi mở; Start → bay tới Moon → cockpit; tới chặng Home có "Next chapter: Mars ▶" → sang chuyến Mars; tải lại trang → "Welcome back… Continue: Mars ▶"; "Choose a flight" mở bảng; không lỗi JS. Các check có sẵn và build: xem kết quả lệnh ở lượt này.
Chưa kiểm tra: giọng thật, điện thoại thật, deploy Vercel.

Task / Owner: Tích hợp mô hình/hoạt cảnh Mars từ Nasa_Space_Apps_Challenge-main-1 / Codex (2026-11-15)

Đã đọc bản main-1 và so sánh với mars-missions hiện tại: các GLB NASA cũ/texture Mars trùng SHA256; phần mới nằm ở loader, InSight IK + ba thiết bị + dây nối, địa hình/camera Sojourner. Bản main-1 thiếu mars-sojourner.js, mars-insight-tethers.js và sojourner-dan.glb; tìm được đủ ba file trong thư mục main bên cạnh, không cần người dùng gửi lại. Không chép package.json/three riêng, index/CSS độc lập hoặc bỏ chat/tour/reward hiện tại.

Tạo/sửa: mars-missions/{mars-models.js,mars-sojourner.js,mars-insight-tethers.js,mars-lander-operations.js,mars-mission-replay.js,mars-site-terrain.js,mars-missions-data.js,mars-missions.js,index.html,mars-chat.js}; public/assets/models/sojourner-dan.glb; content/assets.json/catalog.json; Explorer index/MarsMissionsFrame và World index cho mọi view artifact Mars dùng chung mission map; eval/{load-model-headless.mjs,mars-models.check.mjs,mars-route.check.mjs}; CREDITS, DECISIONS 51–52 và TASKS.

Sojourner: dùng GLB Dan từ thư mục người dùng, CC BY 4.0 đã đối chiếu API Sketchfab; source, author, license và checksum được ghi trong assets.json và hiện dưới Model & sources. Không phải model NASA. File gốc 6,414,204 byte giữ nguyên, SHA256 2df291ab9fadc150f1990d59bca87a9968fc58310875f6b21706f61229ce4086. Sáu bánh được tách pivot trong runtime, scale đồng đều về chiều dài 0.63 m theo catalog; chạy cùng đất đá Mars ở cả click, danh sách và UFO. Viewer Jan Walter Sluka nền trắng ngừng dùng, không trích xuất file từ viewer. Giữ tọa độ và fact cũ, không chép các mốc/vị trí khác nhau từ bản demo mới.

InSight: ghép các phần NASA cũ, bỏ primitive trùng trong runtime, gắp SEIS/WTS/HP3 lần lượt trong khoảng 18 s với dây nối minh họa. Không kéo giãn WTS theo trục Y như bản nguồn: giữ tỉ lệ payload gốc. Camera chuyển rộng khi di chuyển và tới gần để xem thao tác; Sojourner có camera phù hợp kích thước nhỏ. Các thiết bị NASA khác tiếp tục dùng GLB gốc với hoạt cảnh đã tích hợp. Phoenix vẫn ảnh NASA vì cả thư mục mới lẫn cũ không có model này. Tự khám phá chờ cả truyện và replay trước khi bật phần thưởng; tour vẫn do cockpit kể.

Đã kiểm tra: build pass; mars-models.check chạy GLTFLoader thật, giải nén Draco thật trên CPU (chỉ bỏ texture để không cần browser/GPU): năm GLB duy nhất đại diện bảy thiết bị tải được; Sojourner giữ nguyên toàn bộ triangle, có đủ sáu bánh; InSight IK/ba điểm thả/payload scale/dây nối/reset hữu hạn; Viking sampler hoạt động; mọi replay chạy đủ mốc, camera trên mặt đất và callback hoàn thành đúng một lần. mars-route.check đủ tám ID và đúng model ở mọi tour; rewards.check không hồi quy. Dev server trả HEAD 200 cho app, mars-missions và model mới đúng 6,414,204 byte. Không kiểm thử hay thay provider LLM/API key.

Chưa xác nhận hình ảnh/texture/FPS và thao tác bằng UI thực tế trong lượt này; kiểm tra geometry không thay thế QA bằng mắt. Chưa deploy hoặc thử điện thoại thật. Bước kiểm tra demo: reload, mở Mars → Sojourner và InSight → Run; thử cùng hai điểm trong UFO; Sojourner giờ nằm trên địa hình cục bộ, InSight thực hiện đủ ba lượt gắp. Yêu cầu nền Sojourner trước đó đã được giải quyết về triển khai bằng model cục bộ thay vì ghép iframe.

Ghi nhận QA giao diện cuối lượt: Computer Use không kết nối được cả native apps (list_apps timeout) lẫn browser host, nên không thực hiện thao tác UI. Đã dừng phần kiểm tra này và không dùng công cụ khác để điều khiển trình duyệt. Test model không phụ thuộc việc giữ lại thư mục nguồn main/main-1: đối chiếu GLB cục bộ với kích thước và SHA256 đã ghi trong assets.json.

Task / Owner: Hai nút phụ trên lời chào Echo / Codex (2026-11-15)
Sửa Voyage.tsx/voyage.css: Choose a flight và Explore on my own có nền, viền, icon tuyến bay/la bàn, cao tối thiểu 46 px, hover/active/focus rõ ràng; trên màn hẹp nằm dưới nút chính theo hai cột. Giữ callback và nội dung. Kiểm tra npm run build và git diff --check; không thêm unit test cho thay đổi trình bày nhỏ, chưa xác nhận bằng UI thực tế.

Task / Owner: Biểu tượng ba chương Echo / Codex (2026-11-15)
Tạo ChapterEmblem.tsx: SVG Mặt Trăng có miệng hố, Mars đỏ có mảng địa hình và Deep space có hành tinh/vành/quỹ đạo sao. VoyageIntro dùng hình thay ký tự sao/số; chương đã xong có dấu check nhỏ, nhãn screen reader rõ trạng thái. Gradient/clip ID riêng qua useId, không lấy ảnh hoặc đổi tiến độ. voyage.css dùng hình 46 px, 38 px khi hẹp. Build và diff check; chưa xác nhận UI thực tế.

Task / Owner: Remove cockpit caption / Codex (2026-11-15)
Removed the user-circled Pretend UFO / real machines / not to scale caption from Voyage.tsx and its unused vy-window__hud CSS. npm run build and git diff --check passed. No browser visual check; reload the voyage preview to inspect. No missing dependencies.

Task / Owner: Compact discovery reward / Codex (2026-11-15)
Simplified reward-ui.ts and rewards.css: narrower 350px reward dialog, smaller badge, New badge heading, short collection count, Save badge and My badges actions. Removed repetitive text and extra star decorations. Saved state remains explicit; session-only storage warning retained. Claim, persistence and passport behavior unchanged. npm run build and git diff --check passed; no browser visual check. Reload and finish a new discovery to preview.

Task / Owner: Echo welcome narration / Codex (2026-11-15)
Voyage.tsx now speaks the displayed opening greeting with the shared Echo voice profile, including returning and completed-chapter copy. Automatic attempt after the entrance animation, retry on a non-navigation gesture, and accessible Listen/Stop button. Start/Choose/Explore and unmount cancel the greeting before other scenes speak. intro-narration.ts owns playback lifecycle, catches blocked/unsupported speech, restores Listen if the engine silently drops autoplay, and prevents late events or duplicate auto speech. voyage.css styles the compact voice control. Added eval/intro-narration.check.mjs: autoplay, blocked-gesture retry, replay, stop, silent timeout, dispose/navigation and unavailable synthesis pass; npm run build and git diff --check pass. No real browser/audio verification in this turn; actual available voices and autoplay depend on the browser. Reload the welcome screen and use Listen if autoplay is blocked.

Task / Owner: InSight first for Mars demo / Codex (2026-11-15)
Moved the existing InSight entry to the first Mars position in content/catalog.json, mars-missions/mars-missions-data.js and voyage/script.ts. Mars chooser and direct lists now lead with InSight; the Mars flight visits InSight immediately after boarding. Other stops retain relative order and historical dates/facts/models are unchanged. Added first-position assertions to eval/mars-route.check.mjs; route check, npm run build and git diff --check pass. No browser visual check. Reload and choose the Mars flight to demo InSight first.

Task / Owner: Shorter Echo greeting / Codex (2026-11-15)
Shortened the first-visit introduction in Voyage.tsx to two short sentences. Display and narration share the same string, so both use the revised text. git diff --check passed; no build or browser check repeated for this text-only edit.

Task / Owner: Speak immediately on InSight entry / Codex (2026-11-15)
InSight's voyage script now begins with its own first-person introduction; removed the preceding Echo line. Voyage.tsx skips the warp/pre-roll delay for this stop after arrival, keeping the 120ms speech-engine cancellation gap and respecting voice-off. Added speechEnabled to shared mars-chat; Mars and Moon pass false during guided tours so iframe chat open/pagehide cannot cancel the parent cockpit narration. Direct exploration still uses its own narrator. eval/mars-route.check.mjs verifies InSight is the first speaker; route check, npm run build and git diff --check pass. No actual browser/audio verification. Reload and enter InSight in the Mars flight to hear the introduction without waiting for Echo.

Task / Owner: 1.3x narration speed / Codex (2026-11-15)
Added shared SPEECH_SPEED=1.3 in explorer/voice.ts and applied it to default speech rate and every resolved character profile in voyage/voices.ts. Echo welcome, guided voyage, direct storyteller and native Mars/Moon narrators all read 30 percent faster while keeping existing pitch/voice character. Reading fallback estimates scale with the same speed. Updated storyteller.check duration expectations for the requested playback speed; npm run build, storyteller.check and git diff --check pass. No actual audio audition in this turn. Reload and replay the greeting/InSight introduction.

Task / Owner: Slightly faster UFO flight / Codex (2026-11-15)
Changed UFO_FLIGHT_SECONDS in world/ufo-flight.ts from 6 to 5 seconds for shared solar transfers. Camera path, easing, destination tracking and reduced-motion timing unchanged. npm run build and git diff --check passed. No browser visual check; reload and fly to a planet to preview the shorter trip.

Task / Owner: Three-second UFO flight / Codex (2026-11-15)
Set UFO_FLIGHT_SECONDS in world/ufo-flight.ts to 3 seconds as requested. git diff --check passed. No build repeated for this numeric constant change; no browser visual check. Reload to preview.

Task / Owner: Prepare GitHub publication / Codex (2026-11-15)
Prepared the current integrated explorer demo for GitHub. .gitignore excludes the three local reference project folders; their integrated runtime copies remain included. .env is ignored; scanned publishable text and historical text blobs for known local credential values and common secret patterns with no candidates found. Publishable source and assets total about 184 MiB, with no individual file above 45 MiB. npm run build passed. Remote was unset; awaiting the repository URL from the user to configure origin and push. No deployment performed.

Task / Owner: GitHub README and publication / Codex (2026-11-15)
Replaced the obsolete starter-kit README with an English project overview based on the user's supplied introduction, current features, setup, provider environment variables, checks and credits. Corrected collection wording: 17 passport badges across tours/free exploration, with Pioneer 11 available outside the guided route. Documented NASA evidence policy without claiming manual approval or perfect model accuracy, and credited community assets alongside NASA assets. Destination supplied by user: Dawn2310/nasa-space-artifact-explore. Build passed in the publication preparation; README-only update checked with git diff --check. GitHub push and remote-head verification follow this commit; no web deployment requested.

Task / Owner: Netlify production deployment / Codex (2026-11-15)
Added netlify.toml and netlify/functions/chat.mts, sharing handleChat with Vercel/dev. Added .netlify to ignore and eval/netlify-chat.check.mjs; local adapter tests and npm run build pass. Created nasa-space-artifact-explore on the existing Netlify account and configured production LLM settings through site environment variables; no key is committed or present in public build text. The current account does not support granular function-only scopes, so standard site variables are used without a plan change. CLI production deploy 6af93a2663e77da7484436b4 is ready at https://nasa-space-artifact-explore.netlify.app. Live checks: homepage, Mars/Moon pages and Sojourner model return 200; GET /api/chat returns 405; POST InSight question returns 200 grounded with 2 evidence entries and mocked=false (real OpenAI). Added live demo link and deployment notes to README. No browser visual/audio QA during deployment; GitHub automatic deploy is not connected. Manual CLI upload completed without changing plans.

Task / Owner: Always-available floating chatbot / Codex (2026-11-15)
Added GlobalChat.tsx, global-chat.css and global-chat-store.ts at the App root. Floating shuttle opens a modeless chat on welcome, solar, flights, missions and artifact screens; select any of 17 characters, view evidence, retry failures and preserve separate conversations/drafts while navigating during the visit. Active guided/artifact context follows App; same-origin iframe mission selection uses a checked parent message. MarsMissionsFrame externalChat flag hides duplicate embedded launchers while retaining standalone mission chat and narration. Updated shared ShuttleMascot to use unique gradient IDs. No automatic reply speech added, so guided narration is not canceled by opening this chat. Added eval/global-chat.check.mjs covering topic races, separate history, duplicate submissions, retries and unavailable responses. Build, global-chat.check, netlify-chat.check and diff check passed. Deployed to the existing Netlify site, deploy 6af93c1a925e3282fcfb856d. Live homepage and new chat client verified; POST InSight question returns grounded, mocked=false with 2 evidence entries. README updated. No browser visual/keyboard QA performed in this turn. Chats persist for the current page visit, not across reloads.

Task / Owner: Clean cockpit footer and remove Netlify badge / Codex (2026-11-15)
Removed the circled voyage footer text and unused vy-note rule. GlobalChat now receives voyageActive from App and moves its launcher to the upper-right windshield area during tours, leaving Passport and console controls clear; chat panel anchors below it. Disabled the hosting-injected Powered by Netlify badge for all visitors using the site's built_with_badge_enabled setting (no plan change or CSS workaround). npm run build and diff check passed. Production deployment 6af93d11c37be491f94f1e43 ready on the same URL. Live HTML has no badge injection; new entry script has the tour chat placement and no old footer sentence. No browser visual QA this turn. Reload to view.
