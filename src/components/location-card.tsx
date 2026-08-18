import { colors } from '@/constants/colors';
import { getDemoRainOverride } from '@/utils/demoRain';
import { fetchKmaWeather } from '@/utils/kmaWeather';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { WeatherBackground } from './weather-background';

type Props = {
  name: string;
  subtitle: string;
  lat: number | null;
  lng: number | null;
  onPress: () => void;
  onDelete?: () => void;
};

export function LocationCard({ name, subtitle, lat, lng, onPress, onDelete }: Props) {
  const [weather, setWeather] = useState<{ temp: number | null; rain1h: string | null } | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (lat == null || lng == null) return;
    (async () => {
      try {
        const result = await fetchKmaWeather(lat, lng);
        const rainOverride = getDemoRainOverride(subtitle);
        setWeather({ temp: result.temp, rain1h: rainOverride ?? result.rain1h });
      } catch (e) {
        console.log('기상청 조회 실패', e);
      }
    })();
  }, [lat, lng]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const card = (
    <Pressable style={styles.card} onPress={onPress} onLayout={handleLayout}>
      <WeatherBackground rain={weather?.rain1h ?? null} width={size.width} height={size.height} />
      <View style={styles.cardLeft}>
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
        <Text style={styles.cardRain}>
          🌧️ 현재 강수량 {weather?.rain1h ?? '불러오는 중...'}
        </Text>
      </View>
      <Text style={styles.cardTemp}>
        {weather?.temp != null ? `${weather.temp}°` : '...'}
      </Text>
    </Pressable>
  );

  if (!onDelete) {
    return card;
  }

  return (
    <Swipeable
      renderRightActions={() => (
        <View style={styles.deleteWrap}>
          <Pressable style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>✕</Text>
          </Pressable>
        </View>
      )}
    >
      {card}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  cardLeft: { flex: 1 },
  cardRain: { color: '#fff', fontSize: 13, marginTop: 16, fontWeight: '600' },
  cardTemp: { color: '#fff', fontSize: 40, fontWeight: '700' },
  cardName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  cardSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  deleteWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 16,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: { color: '#fff', fontSize: 20, fontWeight: '700' },
});
