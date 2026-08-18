// 데모 시연용: 강남/관악 주소는 호우특보급 강수량으로 표시값을 덮어씀 (실제 기상청 데이터 대신)
export function getDemoRainOverride(region: string): string | null {
    if (region.includes('관악')) return '55.0';
    if (region.includes('강남')) return '35.0';
    return null;
}
