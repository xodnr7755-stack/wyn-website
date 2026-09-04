export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 홈페이지 문의폼 처리
    if (url.pathname === "/api/inquiry") {
      if (request.method !== "POST") {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Method Not Allowed"
          }),
          {
            status: 405,
            headers: {
              "Content-Type": "application/json; charset=UTF-8"
            }
          }
        );
      }

      try {
        const data = await request.json();

        const name = String(data.name || "").trim();
        const phone = String(data.phone || "").trim();
        const email = String(data.email || "").trim();
        const category = String(
          data.category || "미정/상담후결정"
        ).trim();
        const location = String(data.location || "").trim();
        const message = String(data.message || "").trim();

        // 필수값 확인
        if (!name || !phone || !message) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "필수 항목을 입력해 주세요."
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json; charset=UTF-8"
              }
            }
          );
        }

        // 메일 제목
        const subject = `[WYN 견적문의] ${name}`;

        // HTML 특수문자 처리
        const escapeHtml = (value) =>
          value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

        const safeName = escapeHtml(name);
        const safePhone = escapeHtml(phone);
        const safeEmail = escapeHtml(email || "-");
        const safeCategory = escapeHtml(category || "-");
        const safeLocation = escapeHtml(location || "-");
        const safeMessage = escapeHtml(message).replaceAll(
          "\n",
          "<br>"
        );

        // HTML 이메일 내용
        const html = `
          <div style="font-family:Arial,'Malgun Gothic',sans-serif;line-height:1.7;color:#222;">
            <h2 style="margin-bottom:20px;">
              WYN 홈페이지 견적 문의
            </h2>

            <table style="border-collapse:collapse;width:100%;max-width:700px;">
              <tr>
                <th style="text-align:left;padding:10px;border:1px solid #ddd;background:#f5f5f5;width:160px;">
                  성함 / 업체명
                </th>
                <td style="padding:10px;border:1px solid #ddd;">
                  ${safeName}
                </td>
              </tr>

              <tr>
                <th style="text-align:left;padding:10px;border:1px solid #ddd;background:#f5f5f5;">
                  연락처
                </th>
                <td style="padding:10px;border:1px solid #ddd;">
                  ${safePhone}
                </td>
              </tr>

              <tr>
                <th style="text-align:left;padding:10px;border:1px solid #ddd;background:#f5f5f5;">
                  이메일
                </th>
                <td style="padding:10px;border:1px solid #ddd;">
                  ${safeEmail}
                </td>
              </tr>

              <tr>
                <th style="text-align:left;padding:10px;border:1px solid #ddd;background:#f5f5f5;">
                  관심 마감 공종
                </th>
                <td style="padding:10px;border:1px solid #ddd;">
                  ${safeCategory}
                </td>
              </tr>

              <tr>
                <th style="text-align:left;padding:10px;border:1px solid #ddd;background:#f5f5f5;">
                  현장 위치 및 예상 면적
                </th>
                <td style="padding:10px;border:1px solid #ddd;">
                  ${safeLocation}
                </td>
              </tr>

              <tr>
                <th style="text-align:left;padding:10px;border:1px solid #ddd;background:#f5f5f5;">
                  문의 내용
                </th>
                <td style="padding:10px;border:1px solid #ddd;">
                  ${safeMessage}
                </td>
              </tr>
            </table>

            <p style="margin-top:20px;color:#777;font-size:13px;">
              WYN 홈페이지(www.wallyouneed-wyn.com)에서 접수된 문의입니다.
            </p>
          </div>
        `;

        // 일반 텍스트 이메일 내용
        const text = `
WYN 홈페이지 견적 문의

성함 / 업체명: ${name}
연락처: ${phone}
이메일: ${email || "-"}
관심 마감 공종: ${category || "-"}
현장 위치 및 예상 면적: ${location || "-"}

문의 내용:
${message}
        `;

        // 이메일 발송
        await env.EMAIL.send({
          to: "taewook7755@naver.com",
          from: "no-reply@wallyouneed-wyn.com",
          subject: subject,
          html: html,
          text: text,
          ...(email ? { replyTo: email } : {})
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: "문의가 정상적으로 접수되었습니다."
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=UTF-8"
            }
          }
        );

      } catch (error) {
        console.error("Inquiry email error:", error);

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

    // 그 외 요청은 기존 홈페이지 파일 보여주기
    return env.ASSETS.fetch(request);
  }
};
