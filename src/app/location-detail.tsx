import { colors } from '@/constants/colors';
import { WeatherBackground } from '@/components/weather-background';
import { getDemoRainOverride } from '@/utils/demoRain';
import { fetchKmaWeather } from '@/utils/kmaWeather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LocationDetailScreen() {
    const router = useRouter();
    const { name, lat, lng, region } = useLocalSearchParams<{
        name?: string; lat?: string; lng?: string; region?: string;
    }>();
    const [weather, setWeather] = useState<{
        temp: number | null; rain1h: string | null; windSpeed: number | null;
        humidity: number | null; condition: string;
    } | null>(null);

    useEffect(() => {
        if (!lat || !lng) return;
        (async () => {
            try {
                const result = await fetchKmaWeather(Number(lat), Number(lng));
                const rainOverride = getDemoRainOverride(region ?? '');
                setWeather({ ...result, rain1h: rainOverride ?? result.rain1h });
            } catch (e) {
                console.log('기상청 조회 실패', e);
            }
        })();
    }, [lat, lng]);

    const handleAnalyze = () => {
        router.push({
            pathname: '/result',
            params: { address: name, region, lat, lng },
        });
    };

    return (
        <View style={styles.container}>
            <WeatherBackground rain={weather?.rain1h ?? null} width={screenWidth} height={screenHeight} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()}>
                        <Text style={styles.backButton}>‹ 이전</Text>
                    </Pressable>
                    <Text style={styles.headerLogo}>≋ 비켜줄래?</Text>
                </View>

                <View style={styles.hero}>
                    <Text style={styles.heroName}>{name}</Text>
                    <Text style={styles.heroTemp}>
                        {weather?.temp != null ? `${weather.temp}°` : '...'}
                    </Text>
                    <Text style={styles.heroCondition}>
                        {weather?.condition ?? '불러오는 중...'}
                    </Text>
                </View>

                <View style={styles.statsPanel}>
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>🌧️</Text>
                        <Text style={styles.statLabel}>강수량</Text>
                        <Text style={styles.statValue}>{weather?.rain1h ?? '-'}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>💨</Text>
                        <Text style={styles.statLabel}>풍속</Text>
                        <Text style={styles.statValue}>
                            {weather?.windSpeed != null ? `${weather.windSpeed}m/s` : '-'}
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>💧</Text>
                        <Text style={styles.statLabel}>습도</Text>
                        <Text style={styles.statValue}>
                            {weather?.humidity != null ? `${weather.humidity}%` : '-'}
                        </Text>
                    </View>
                </View>

                <Pressable onPress={handleAnalyze} style={styles.analyzeButton}>
                    <Text style={styles.analyzeButtonText}>침수 위험 분석하기</Text>
                </Pressable>

                <Text style={styles.infoText}>
                    ⓘ 본 위험도는 공공데이터 기반 AI 예측 결과이며, 공식 재난 경보를 대체하지 않습니다.
                </Text>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backButton: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '600' },
    headerLogo: { color: '#fff', fontSize: 13, fontWeight: '600' },
    container: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
    safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },

    hero: { alignItems: 'center', marginTop: 32 },
    heroName: { color: '#fff', fontSize: 22, fontWeight: '700' },
    heroTemp: { color: '#fff', fontSize: 72, fontWeight: '200', marginTop: 4 },
    heroCondition: { color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 4 },

    statsPanel: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 12,
        marginTop: 40,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statIcon: { fontSize: 18 },
    statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 6 },
    statValue: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 4 },
    statDivider: { width: 1, backgroundColor: colors.background, marginHorizontal: 12 },

    analyzeButton: {
        marginTop: 24, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
        backgroundColor: colors.accentBlue,
    },
    analyzeButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
    infoText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 18, marginTop: 16 },
});
