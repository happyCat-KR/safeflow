// 시연용: 특정 주소만 정확히 매칭해서 위험도 점수/강수량을 고정값으로 덮어씀
export function getDemoScoreOverride(region: string): { score: number; rain1h: number; rain3h: number } | null {
    if (region.includes('자곡로 55') || region.includes('자곡로55')) {
        return { score: 55, rain1h: 35, rain3h: 65 }; // 주의
    }
    if (region.includes('남부순환로218길 1') || region.includes('남부순환로 218길 1')) {
        return { score: 85, rain1h: 55, rain3h: 95 }; // 위험(높음)
    }
    return null;
}
