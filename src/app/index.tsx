import { AI_API_BASE_URL, DEMO_LOCATION } from '@/constants/aiConfig';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [address, setAddress] = useState(DEMO_LOCATION.displayName);
  const [locationReady] = useState(true);
  const [rainfall, setRainfall] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${AI_API_BASE_URL}/api/current-status?lat=${DEMO_LOCATION.lat}&lng=${DEMO_LOCATION.lng}&region=${encodeURIComponent(DEMO_LOCATION.region)}`
        );
        const data = await res.json();
        setRainfall(data.currentRainfall);
      } catch (e) {
        console.log('강수량 조회 실패', e);
      }
    })();
  }, []);

  const handleAnalyze = () => {
    router.push({ 
      pathname: '/result',
      params: { address, lat: String(DEMO_LOCATION.lat), lng: String(DEMO_LOCATION.lng) },
    });
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Step 2에서 헤더 + 위치 섹션 채울 자리 */}

        <View style={styles.header}>
          <Text style={styles.headerLogo}>≋ 비켜줄래?</Text>
        </View>

        <View style={styles.locationSection}>
          <Text style={styles.locationLabel}>📍 현재 위치 · GPS</Text>
          <Text style={styles.locationTitle}>{address}</Text>
          <Text style={styles.locationDesc}>
            내 위치 주변의 침수 위험을 AI가 실시간으로 예측합니다.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>🌧️ 현재 강수량</Text>
            <Text style={styles.statValue}>
              {rainfall !== null ? `${rainfall}mm/h` : '불러오는 중...'}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleAnalyze}
          disabled={!locationReady}
          style={({ pressed }) => ({ opacity: !locationReady ? 0.4 : pressed ? 0.8 : 1 })}
        >
          <LinearGradient
            colors={[colors.accentTeal, colors.accentBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.analyzeButton}
          >
            <Text style={styles.analyzeButtonText}>침수 위험 분석하기</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.infoText}>
          ⓘ 본 위험도는 공공데이터 기반 AI 예측 결과이며, 공식 재난 경보를 대체하지 않습니다.
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-end',
  },
  headerLogo: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  locationSection: {
    marginTop: 24,
  },
  locationLabel: {
    color: colors.accentTeal,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  locationDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  analyzeButton: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
  },
});
