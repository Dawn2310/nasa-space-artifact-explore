# Thiết kế sản phẩm

## Ý tưởng
Trẻ em (10–14 tuổi) là "điều phối viên trực đêm" ở trạm liên lạc không gian sâu.
Trạm bắt được tín hiệu yếu từ những cỗ máy NASA đã im lặng. Trẻ đánh thức từng
hiện vật, nghe nó kể chuyện, và ghi lại ký ức của nó.

## Ba tầng 3D
1. **Solar** — Mặt Trời, Trái Đất + Mặt Trăng, sao Hỏa (bấm được), các hành tinh
   trang trí, và 5 chấm deep-space: Dawn (tại Ceres), NEAR Shoemaker (tại Eros),
   Pioneer 10, Pioneer 11, Kepler. Nhãn "Not to scale".
2. **Surface** — globe Mặt Trăng (4 chấm) hoặc sao Hỏa (8 chấm) đặt theo tọa độ nguồn.
3. **Artifact** — model 3D hoặc ảnh NASA, thẻ dữ kiện có nguồn, chat (3 nhân vật).

## Bốn nhịp truyện mỗi hiện vật
Đánh thức (lời chào + 3 câu gợi ý) → Kể lại (thẻ/chat, bưu thiếp ảnh, sổ ký ức)
→ Ký ức bị khóa (robot không biết chuyện sau ngày mất liên lạc, hỏi ngược lại trẻ)
→ Lời chào cuối (nối khám phá của nó với nhiệm vụ đời sau).

## 17 hiện vật
| Nơi | Hiện vật | Hiển thị | Mức |
|---|---|---|---|
| Moon | Surveyor 3 | ảnh | chat |
| Moon | Apollo 11 Eagle descent stage | model (nguyên tàu LM, có nhãn) | thẻ |
| Moon | Apollo 15 LRV | ảnh | thẻ |
| Moon | Apollo 12 ALSEP | ảnh | thẻ |
| Mars | Sojourner | ảnh | thẻ |
| Mars | Spirit | model Opportunity (xe song sinh, có nhãn) | thẻ |
| Mars | Opportunity | model (thô) + ảnh | chat |
| Mars | Viking 1 | model | chat |
| Mars | Viking 2 | model Viking Lander | thẻ |
| Mars | Phoenix | ảnh | thẻ |
| Mars | InSight | model | thẻ |
| Mars | Ingenuity | model | thẻ |
| Deep space | Dawn | model | thẻ |
| Deep space | NEAR Shoemaker | model | thẻ |
| Deep space | Pioneer 10 | model | thẻ (chat nếu kịp) |
| Deep space | Pioneer 11 | model Pioneer 10 (có nhãn) | thẻ |
| Deep space | Kepler | model | thẻ |

## Luồng chat có nguồn
Câu hỏi → kiểm tra đầu vào → lấy facts đã duyệt của đúng hiện vật, bỏ facts sau
memoryCutoff → LLM trả JSON {answer, factIds, answerable} theo persona → server
đối chiếu factIds và mọi con số với facts → trả lời kèm nguồn, hoặc câu từ chối
soạn sẵn. Đánh giá bằng eval/: tỉ lệ đúng, tỉ lệ từ chối đúng, tỉ lệ trích dẫn hợp lệ.

## Kiến trúc
React + Vite + TypeScript; React Three Fiber + Drei; API serverless trên Vercel;
LLM qua adapter có chế độ mock. Hợp đồng dữ liệu: src/shared/contracts.ts.

## Yêu cầu nộp bài cần nhớ
Giao diện và trang nộp bằng tiếng Anh; demo <= 30 giây hoặc <= 7 slide; link công
khai; liệt kê NASA Data; khai báo AI; không dùng logo NASA.
(Theo hướng dẫn các năm trước — đối chiếu lại với Project Submission Guide 2026.)
