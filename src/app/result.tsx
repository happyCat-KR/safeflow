import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const loadingSteps = [
    '기상 데이터 확인',
    '수위 데이터 확인',
    '과거 침수 데이터 대조',
    'AI 위험도 계산',
];

function getRiskInfo(score: number) {
    if (score >= 70) {
        return {
            grade: 'danger',
            label: '높음',
            badgeColor: colors.danger,
            showEta: true,
            showAction: true,
        };
    }
    if (score >= 40) {
        return {
            grade: 'caution',
            label: '주의',
            badgeColor: colors.caution,
            showEta: false,
            showAction: true,
        };
    }
    return {
        grade: 'safe',
        label: '낮음',
        badgeColor: colors.safe,
        showEta: false,
        showAction: false,
    };
}

export default function ResultScreen() {
    const { address, region } = useLocalSearchParams<{ address?: string; region?: string }>();
    const resolvedAddress = address || region;
    const [visibleSteps, setVisibleSteps] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [result] = useState(() => ({
        score: Math.floor(Math.random() * 100),
        rain1h: Math.floor(Math.random() * 40),
        rain3h: Math.floor(Math.random() * 80),
        waterLevelChange: (Math.random() * 1.2).toFixed(1),
        etaHours: Math.floor(Math.random() * 4) + 1,
    }));
    const info = getRiskInfo(result.score);

    useEffect(() => {
        if (visibleSteps >= loadingSteps.length) {
            const timer = setTimeout(() => setIsLoading(false), 500);
            return () => clearTimeout(timer);
        }

        const timer = setTimeout(() => setVisibleSteps((count) => count + 1), 500);
        return () => clearTimeout(timer);
    }, [visibleSteps]);

    if (!resolvedAddress) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <Text style={styles.headerLogo}>≋ SafeFlow</Text>
                    </View>
                    <View style={styles.loadingCenter}>
                        <Text style={styles.loadingTitle}>위치 정보를 확인할 수 없어요</Text>
                        <Text style={styles.loadingSubtitle}>홈 화면에서 다시 시도해주세요</Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <Text style={styles.headerLogo}>≋ SafeFlow</Text>
                    </View>

                    <View style={styles.loadingCenter}>
                        <ActivityIndicator size="large" color={colors.accentBlue} />
                        <Text style={styles.loadingTitle}>지역 데이터를 분석 중</Text>
                        <Text style={styles.loadingSubtitle}>{resolvedAddress}</Text>

                        <View style={styles.stepList}>
                            {loadingSteps.slice(0, visibleSteps).map((step) => (
                                <View key={step} style={styles.stepRow}>
                                    <Text style={styles.stepCheck}>✅</Text>
                                    <Text style={styles.stepText}>{step}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerLogo}>≋ SafeFlow</Text>
                </View>

                <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: info.badgeColor }]} />
                    <Text style={[styles.statusText, { color: info.badgeColor }]}>
                        침수 위험 {info.label}
                    </Text>
                </View>

                <Text style={styles.locationTitle}>{resolvedAddress}</Text>

                <LinearGradient
                    colors={[colors.accentTeal, colors.accentBlue]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.riskCard}
                >
                    <Text style={styles.riskCardLabel}>AI 침수 위험도</Text>
                    <Text style={styles.riskPercent}>{result.score}%</Text>
                    <View style={[styles.riskGradeBadge, { backgroundColor: info.badgeColor }]}>
                        <Text style={styles.riskGradeText}>위험등급 · {info.label}</Text>
                    </View>
                </LinearGradient>

                {info.showEta && (
                    <View style={styles.etaCard}>
                        <Text style={styles.etaIcon}>⚠️</Text>
                        <View>
                            <Text style={styles.etaLabel}>예상 위험 증가</Text>
                            <Text style={styles.etaValue}>약 {result.etaHours}시간 이내</Text>
                        </View>
                    </View>
                )}

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>1h 강수</Text>
                        <Text style={styles.statValue}>{result.rain1h}mm</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>3h 누적</Text>
                        <Text style={styles.statValue}>{result.rain3h}mm</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>수위 상승</Text>
                        <Text style={styles.statValue}>+{result.waterLevelChange}m</Text>
                    </View>
                </View>

                {info.showAction && (
                    <Pressable style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>내 상황에 맞는 행동 확인</Text>
                        <Text style={styles.actionButtonArrow}>→</Text>
                    </Pressable>
                )}

                <Text style={styles.infoText}>
                    ⓘ 본 위험도는 공공데이터 기반 AI 예측 결과이며, 공식 재난 경보를 대체하지 않습니다.
                </Text>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    header: {
        alignItems: 'flex-end',
    },
    headerLogo: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    loadingCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginTop: 20,
    },
    loadingSubtitle: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 6,
    },
    stepList: {
        marginTop: 32,
        gap: 14,
        alignSelf: 'stretch',
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepCheck: {
        fontSize: 14,
    },
    stepText: {
        color: colors.textPrimary,
        fontSize: 14,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 24,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },
    locationTitle: {
        color: colors.textPrimary,
        fontSize: 22,
        fontWeight: '700',
        marginTop: 8,
    },
    riskCard: {
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    riskCardLabel: {
        color: colors.background,
        fontSize: 13,
        fontWeight: '600',
    },
    riskPercent: {
        color: colors.background,
        fontSize: 44,
        fontWeight: '800',
        marginTop: 8,
    },
    riskGradeBadge: {
        marginTop: 8,
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    riskGradeText: {
        color: colors.background,
        fontSize: 12,
        fontWeight: '700',
    },
    etaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 16,
        marginTop: 16,
    },
    etaIcon: {
        fontSize: 18,
    },
    etaLabel: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    etaValue: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        marginTop: 2,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.danger,
        borderRadius: 14,
        paddingVertical: 16,
        marginTop: 24,
    },
    actionButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    actionButtonArrow: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
    },
    statLabel: {
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: 8,
    },
    statValue: {
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: '700',
    },
    infoText: {
        color: colors.textSecondary,
        fontSize: 12,
        lineHeight: 18,
        marginTop: 16,
    },
});
