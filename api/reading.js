
// 운명타로 - 작은 서버(뒷방)
// 역할: 안전하게 보관된 AI 열쇠를 붙여서 AI에게 풀이를 요청하고, 결과만 돌려준다.
// ⚠️ 열쇠(키)는 이 코드에 절대 적지 않는다. Vercel 설정의 "환경 변수"에만 넣는다.
 
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST 요청만 받아요" });
    return;
  }
 
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: "서버에 AI 열쇠(ANTHROPIC_API_KEY)가 설정되지 않았어요" });
    return;
  }
 
  try {
    const { prompt } = req.body || {};
    if (!prompt) {
      res.status(400).json({ error: "질문 내용이 비어 있어요" });
      return;
    }
 
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // 저렴한 모델. 더 풍부하게 원하면 "claude-sonnet-4-6"로 교체
        max_tokens: 1000,
        messages: [{ role: "user", content: String(prompt) }],
      }),
    });
 
    const data = await r.json();
 
    if (!r.ok) {
      res.status(502).json({ error: "AI 응답 오류", detail: data });
      return;
    }
 
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
 
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "AI 호출 중 문제가 생겼어요" });
  }
}
