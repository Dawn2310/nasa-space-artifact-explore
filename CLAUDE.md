# NASA Space Artifact Explorer — Ground Rules

Dự án hackathon NASA Space Apps 2026, đề "Abandoned but not Forgotten".
Ứng dụng khám phá hiện vật không gian cho trẻ em 10–14 tuổi:
ba tầng **solar → surface (moon/mars) → artifact**, 17 thẻ hiện vật,
3 nhân vật chat có trích nguồn (Opportunity, Surveyor 3, Viking 1).

Deadline cứng: Chủ nhật 15/11/2026, 23:59 giờ Việt Nam. Ưu tiên một
đường đi hoàn chỉnh chạy thật hơn là nhiều tính năng dang dở.

## Luật chung cho mọi agent

- Đọc `src/shared/contracts.ts`, `TASKS.md` và `docs/DECISIONS.md` trước khi làm.
- Chỉ ghi file trong phạm vi được giao ở định nghĩa agent của mình.
  KHÔNG tự sửa contracts, dependency gốc, ID hiện vật, routing hoặc
  cấu hình dùng chung — đề xuất cho Lead (phiên chính) nếu cần.
- Dùng mock đúng hợp đồng để tiến hành khi phần khác chưa có; ghi rõ là mock.
- KHÔNG bịa nguồn, dữ kiện, tọa độ, đường dẫn tài nguyên hoặc kết quả kiểm thử.
  Thiếu thì để trống và báo lại.
- KHÔNG đưa API key vào client. Key chỉ nằm trong env của server.
- KHÔNG đánh dấu task hoàn thành khi chỉ có mock.
- Mỗi bàn giao ghi vào cuối `TASKS.md`: file đã tạo/sửa, cách chạy,
  điều đã kiểm tra, điều chưa kiểm tra, phụ thuộc còn thiếu, bước tiếp theo.
- Nội dung hướng tới trẻ em: tiếng Anh đơn giản, 2–4 câu mỗi lượt trả lời,
  không tự nhận có ý thức, nhập vai không được đổi lịch sử.

## Stack (Lead đã chốt — không đổi)

- Frontend: React + TypeScript + Vite, React Three Fiber + Drei cho 3D.
- Backend: Vercel serverless functions trong `api/` (Node + TypeScript).
- LLM: adapter chung trong `server/llm.ts` đọc `LLM_PROVIDER` + `LLM_API_KEY`
  từ env; hỗ trợ chế độ `mock` (trả lời từ fixture) vì đội CHƯA có khóa.
  Mọi tính năng phải chạy được full ở chế độ mock.
- Deploy: Vercel. Không dùng tính năng nào Vercel free tier không có.

## Sự thật khoa học bắt buộc (không được viết khác)

1. Opportunity: liên lạc cuối 10/06/2018; NASA tuyên bố kết thúc nhiệm vụ
   13/02/2019. Thẻ hiển thị cả hai mốc.
2. Ingenuity: nơi dừng cuối là Valinor Hills, khác nơi triển khai.
   Marker phải ghi rõ nó thể hiện loại vị trí nào (landing/final-resting).
3. Apollo 11: tầng hạ cánh Eagle và gương phản xạ laser (LRRR, thuộc EASEP)
   là hai hiện vật khác nhau đặt gần nhau.
4. Pioneer 10/11, Kepler, Dawn, NEAR: KHÔNG ở sao Hỏa. Dawn quay quanh Ceres,
   NEAR nằm trên Eros, Kepler theo quỹ đạo quanh Mặt Trời, Pioneer rời hệ
   Mặt Trời. Chấm của chúng ở tầng solar là minh họa, có nhãn "illustrative".
5. ALSEP trong tài nguyên đề (1969-099C) là bộ của Apollo 12.
6. Mọi cảnh 3D có nhãn "Not to scale".

## Tài nguyên — luật "không chế"

- `public/assets/` đã có sẵn 9 model GLB và 6 texture hành tinh, lấy NGUYÊN BẢN
  từ kho chính thức github.com/nasa/NASA-3D-Resources tại commit ghi trong
  `content/assets.json` (kèm sha256). Chạy `scripts/verify_assets.sh` để kiểm.
- KHÔNG sửa hình dạng model, KHÔNG tạo model/ảnh/texture bằng AI để thay hiện
  vật thật, KHÔNG lấy asset từ nguồn ngoài NASA/USGS. Được phép nén (gltf-transform)
  nhưng phải ghi lại trong assets.json.
- Model dùng chung phải ghi nhãn trung thực trên thẻ: Spirit dùng model
  Opportunity (xe song sinh), Viking 2 dùng model Viking Lander, Pioneer 11 dùng
  model Pioneer 10, Eagle dùng model nguyên tàu Lunar Module (chỉ tầng hạ cánh
  còn trên Mặt Trăng).
- 5 hiện vật KHÔNG có model chính thức (surveyor-3, apollo-15-lrv,
  apollo-12-alsep, sojourner, phoenix): viewer dùng ảnh NASA, không dựng thay.
- Texture Mặt Trăng CHƯA có: xem `stillToDownload` trong assets.json. Cho tới
  khi người thật tải về, globe Mặt Trăng dùng màu xám phẳng, không dùng ảnh khác.
- Kinh độ tâm của `textures/mars.jpg` chưa xác minh: phải hiệu chuẩn marker
  bằng một địa danh biết trước rồi ghi kết quả vào docs/DECISIONS.md.

## Vai trò

Phiên chính = Lead/Integrator: scaffold, contracts, tích hợp, giao việc
cho các subagent trong `.claude/agents/` (nasa-research, world3d, ui-story,
grounded-chat, qa). Lead cập nhật `TASKS.md` sau mỗi lần tích hợp và ghi
mọi thay đổi hợp đồng vào `docs/DECISIONS.md`.
