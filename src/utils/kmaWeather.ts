import { KMA_SERVICE_KEY } from '@/constants/aiConfig';

// 위경도 → 기상청 격자좌표(nx, ny) 변환 (기상청 공식 변환식)
function latLngToGrid(lat: number, lng: number) {
    const RE = 6371.00877, GRID = 5.0, SLAT1 = 30.0, SLAT2 = 60.0, OLON = 126.0, OLAT = 38.0, XO = 43, YO = 136;
    const DEGRAD = Math.PI / 180.0;
    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD, slat2 = SLAT2 * DEGRAD, olon = OLON * DEGRAD, olat = OLAT * DEGRAD;

    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = (re * sf) / Math.pow(ro, sn);

    let ra = Math.tan(Math.PI * 0.25 + (lat * DEGRAD) * 0.5);
    ra = (re * sf) / Math.pow(ra, sn);
    let theta = lng * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;

    return {
        nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
        ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
    };
}

// 초단기실황은 매시 40분 이후 발표되므로, 40분 전이면 이전 시각 자료를 씀
function getBaseDateTime() {
    const now = new Date();
    if (now.getMinutes() < 40) now.setHours(now.getHours() - 1);
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    return { baseDate: `${yyyy}${mm}${dd}`, baseTime: `${hh}00` };
}

// 강수형태(PTY) 코드를 사람이 읽을 문구로 변환
function getConditionText(pty: string | undefined) {
    switch (pty) {
        case '1': return '비가 내리고 있어요';
        case '2': return '비와 눈이 섞여 내리고 있어요';
        case '3': return '눈이 내리고 있어요';
        case '5': return '빗방울이 떨어지고 있어요';
        case '6': return '빗방울과 눈날림이 있어요';
        case '7': return '눈날림이 있어요';
        default: return '비/눈 소식 없음';
    }
}

export async function fetchKmaWeather(lat: number, lng: number) {
    const { nx, ny } = latLngToGrid(lat, lng);
    const { baseDate, baseTime } = getBaseDateTime();
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${encodeURIComponent(KMA_SERVICE_KEY)}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

    const res = await fetch(url);
    const data = await res.json();
    const items = data.response?.body?.items?.item ?? [];

    const values: Record<string, string> = {};
    for (const item of items) values[item.category] = item.obsrValue;

    return {
        temp: values['T1H'] ? Number(values['T1H']) : null,        // 기온(℃)
        rain1h: values['RN1'] ?? null,                               // 1시간 강수량(mm, "강수없음"일 수 있음)
        windSpeed: values['WSD'] ? Number(values['WSD']) : null,    // 풍속(m/s)
        humidity: values['REH'] ? Number(values['REH']) : null,      // 습도(%)
        condition: getConditionText(values['PTY']),                 // 날씨 한줄 요약
    };
}
