# Bộ kit khởi động — NASA Space Artifact Explorer

Bộ này chứa thiết kế, luật chung, hợp đồng dữ liệu, 5 định nghĩa agent cho Claude Code,
và tài nguyên 3D chính thức của NASA (9 model GLB, 6 texture) đã kiểm checksum.
Chưa có code ứng dụng: phiên chính của Claude Code (Lead) sẽ dựng.

## Trong kit có gì

| File | Vai trò |
|---|---|
| `CLAUDE.md` | Luật chung, stack, 6 sự thật khoa học bắt buộc. Claude Code tự đọc. |
| `.claude/agents/*.md` | 5 subagent: nasa-research, world3d, ui-story, grounded-chat, qa |
| `src/shared/contracts.ts` | Hợp đồng dữ liệu + API. Chỉ Lead sửa. |
| `content/catalog.seed.json` | 17 hiện vật, ID, phân loại, link tài nguyên của đề |
| `docs/DESIGN.md` | Thiết kế sản phẩm: ba tầng, truyện, 17 hiện vật, luồng chat |
| `public/assets/` | Model và texture nguyên bản từ nasa/NASA-3D-Resources |
| `content/assets.json` | Nguồn, dung lượng, sha256 từng file; việc còn phải tải |
| `scripts/` | `verify_assets.sh` kiểm checksum; `fetch_nasa_assets.sh` tải lại từ NASA |
| `CREDITS.md` | Ghi nguồn, dùng cho trường NASA Data khi nộp |
| `TASKS.md` | Các đợt việc, mốc ghép, việc của người thật, thứ tự cắt giảm |
| `docs/DECISIONS.md` | Nhật ký quyết định |

## Cách chạy

1. Giải nén vào một thư mục trống, rồi:

   ```bash
   git init && git add -A && git commit -m "Starter kit"
   claude
   ```

2. Trong Claude Code, gõ `/agents` để xác nhận thấy đủ 5 agent.

3. Dán lệnh khởi động cho phiên chính (Lead):

   ```text
   Bạn là Lead/Integrator. Đọc CLAUDE.md, TASKS.md, src/shared/contracts.ts
   và content/catalog.seed.json. Làm Đợt 0 trong TASKS.md: dựng scaffold,
   mock, App giữ ViewState. Chạy npm run build để xác nhận, commit, rồi báo
   lại cho tôi trước khi sang Đợt 1.
   ```

4. Khi Đợt 0 xong, dán:

   ```text
   Chạy Đợt 1: giao song song cho ba subagent nasa-research, world3d và
   ui-story theo đúng phạm vi ghi của từng agent. nasa-research làm
   opportunity trước. Khi cả ba bàn giao, tích hợp để đạt Mốc ghép 1,
   chạy thử trên trình duyệt, commit, cập nhật TASKS.md.
   ```

5. Tiếp tục theo từng đợt trong `TASKS.md`. Sau mỗi mốc ghép, gọi:
   `Dùng subagent qa kiểm tra bản hiện tại và ghi lỗi vào qa/bugs.md.`

## Lưu ý vận hành

- Giữ MỘT phiên Claude Code làm Lead trên repo này. Nếu muốn chạy song song
  thật, chỉ mở thêm một cửa sổ cho nasa-research (nó chỉ ghi vào `content/`).
- Commit sau mỗi mốc ghép để lùi lại được khi một agent làm hỏng.
- Trong lúc agent chạy, người thật duyệt dữ kiện trong `content/facts.json`
  ngay khi research bàn giao từng hiện vật. Server chat chỉ dùng facts "approved",
  nên chưa duyệt thì robot chưa trả lời được.
- Giá trị `displayYears` và `memoryCutoff` trong catalog.seed.json là khởi tạo,
  chưa đối chiếu nguồn. Research và người duyệt phải xác nhận.
- Khi có khóa LLM: đặt `LLM_PROVIDER` và `LLM_API_KEY` trong Vercel
  (Settings → Environment Variables), không commit vào repo.
