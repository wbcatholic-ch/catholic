// Cloudflare Worker: Kakao REST Proxy for 가톨릭길동무
// Settings > Variables 에 KAKAO_REST_API_KEY 값을 Secret 으로 저장하세요.
// 지원 호출 예:
//   /?endpoint=directions&origin=128.591,35.871&destination=128.589,35.88&priority=RECOMMEND
//   /?endpoint=keyword&query=성당&size=10

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);

    const key = env.KAKAO_REST_API_KEY;
    if (!key) return json({ error: 'missing_KAKAO_REST_API_KEY' }, 500);

    const url = new URL(request.url);
    const endpoint = (url.searchParams.get('endpoint') || '').toLowerCase();
    let kakaoUrl;

    if (endpoint === 'directions') {
      const origin = url.searchParams.get('origin');
      const destination = url.searchParams.get('destination');
      const priority = url.searchParams.get('priority') || 'RECOMMEND';
      if (!origin || !destination) return json({ error: 'missing_origin_or_destination' }, 400);
      kakaoUrl = new URL('https://apis-navi.kakaomobility.com/v1/directions');
      kakaoUrl.searchParams.set('origin', origin);
      kakaoUrl.searchParams.set('destination', destination);
      kakaoUrl.searchParams.set('priority', priority);
    } else if (endpoint === 'keyword') {
      const query = url.searchParams.get('query');
      const size = url.searchParams.get('size') || '10';
      if (!query) return json({ error: 'missing_query' }, 400);
      kakaoUrl = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
      kakaoUrl.searchParams.set('query', query);
      kakaoUrl.searchParams.set('size', size);
    } else {
      return json({ error: 'unknown_endpoint', endpoint }, 400);
    }

    const res = await fetch(kakaoUrl.toString(), {
      headers: { Authorization: `KakaoAK ${key}` },
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { ...CORS_HEADERS, 'Content-Type': res.headers.get('Content-Type') || 'application/json; charset=utf-8' },
    });
  },
};
