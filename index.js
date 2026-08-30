export default {
  async fetch(request, env) {

    // =========================================
    // 1. 견적문의 POST 처리
    // =========================================

    if (
      request.method === "POST" &&
      new URL(request.url).pathname === "/api/quote"
    ) {

      try {

        const data = await request.json();

        // -----------------------------
        // 입력값
        // -----------------------------

        const name = String(data.name || "").trim();
        const phone = String(data.phone || "").trim();
        const email = String(data.email || "").trim();
        const location = String(data.location || "").trim();
        const area = String(data.area || "").trim();
        const service = String(data.service || "").trim();
        const message = String(data.message || "").trim();

        // -----------------------------
        // 필수값 검사
        // -----------------------------

        if (!name || !phone || !message) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "필수 항목을 입력해주세요."
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json; charset=UTF-8"
              }
            }
          );
        }

        // -----------------------------
        // 너무 긴 입력 방지
        // -----------------------------

        if (
          name.length > 100 ||
          phone.length > 50 ||
          email.length > 150 ||
          location.length > 200 ||
          area.length > 100 ||
          service.length > 200 ||
          message.length > 5000
        ) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "입력 내용이 너무 깁니다."
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json; charset=UTF-8"
              }
            }
          );
        }

        // =========================================
        // 2. 이메일 내용
        // =========================================

        const subject =
          `[홈페이지 견적문의] ${name}님 문의`;

        const text = `
새로운 홈페이지 견적문의가 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━
고객 정보
━━━━━━━━━━━━━━━━━━━━

이름
${name}

연락처
${phone}

이메일
${email || "미입력"}

시공 장소
${location || "미입력"}

평수 / 면적
${area || "미입력"}

시공 종류
${service || "미입력"}

━━━━━━━━━━━━━━━━━━━━
문의 내용
━━━━━━━━━━━━━━━━━━━━

${message}

━━━━━━━━━━━━━━━━━━━━
WYN 홈페이지 견적문의 시스템
━━━━━━━━━━━━━━━━━━━━
`;

        // HTML 이메일
        const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>홈페이지 견적문의</title>
</head>

<body style="
  margin:0;
  padding:30px;
  background:#f5f5f5;
  font-family:Arial,'Malgun Gothic',sans-serif;
">

<div style="
  max-width:700px;
  margin:0 auto;
  background:#ffffff;
  padding:40px;
  border-radius:12px;
">

<h2 style="
  margin-top:0;
  border-bottom:2px solid #111;
  padding-bottom:15px;
">
홈페이지 견적문의
</h2>

<table style="
  width:100%;
  border-collapse:collapse;
  margin-top:25px;
">

<tr>
<td style="padding:12px;border-bottom:1px solid #eee;width:140px;font-weight:bold;">
이름
</td>
<td style="padding:12px;border-bottom:1px solid #eee;">
${escapeHtml(name)}
</td>
</tr>

<tr>
<td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;">
연락처
</td>
<td style="padding:12px;border-bottom:1px solid #eee;">
${escapeHtml(phone)}
</td>
</tr>

<tr>
<td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;">
이메일
</td>
<td style="padding:12px;border-bottom:1px solid #eee;">
${escapeHtml(email || "미입력")}
</td>
</tr>

<tr>
<td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;">
시공 장소
</td>
<td style="padding:12px;border-bottom:1px solid #eee;">
${escapeHtml(location || "미입력")}
</td>
</tr>

<tr>
<td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;">
평수 / 면적
</td>
<td style="padding:12px;border-bottom:1px solid #eee;">
${escapeHtml(area || "미입력")}
</td>
</tr>

<tr>
<td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;">
시공 종류
</td>
<td style="padding:12px;border-bottom:1px solid #eee;">
${escapeHtml(service || "미입력")}
</td>
</tr>

</table>

<h3 style="margin-top:35px;">
문의 내용
</h3>

<div style="
  padding:20px;
  background:#f7f7f7;
  border-radius:8px;
  white-space:pre-wrap;
  line-height:1.7;
">
${escapeHtml(message)}
</div>

<p style="
  margin-top:35px;
  color:#888;
  font-size:13px;
">
WYN 홈페이지에서 자동으로 전달된 견적문의입니다.
</p>

</div>

</body>
</html>
`;

        // =========================================
        // 3. Cloudflare Email Service로 전송
        // =========================================

        await env.EMAIL.send({
          from: "noreply@yourdomain.com",
          to: "여기에_네이버메일주소@naver.com",
          subject: subject,
          text: text,
          html: html
        });

        // =========================================
        // 4. 성공 응답
        // =========================================

        return new Response(
          JSON.stringify({
            success: true,
            message: "견적문의가 정상적으로 접수되었습니다."
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=UTF-8"
            }
          }
        );

      } catch (error) {

        console.error("견적문의 오류:", error);

        return new Response(
          JSON.stringify({
            success: false,
            message: "메일 전송 중 오류가 발생했습니다."
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json; charset=UTF-8"
            }
          }
        );
      }
    }

    // =========================================
    // 5. 홈페이지 파일 제공
    // =========================================

    return env.ASSETS.fetch(request);
  }
};


// =========================================
// HTML 특수문자 방지
// =========================================

function escapeHtml(value) {

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
