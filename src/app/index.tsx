import { LocationCard } from '@/components/location-card';
import { Cloud } from '@/components/weather-background';
import { colors } from '@/constants/colors';
import { useLocations } from '@/contexts/locations-context';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function LocationListScreen() {
  const [name, setName] = useState('위치 확인 중...');
  const router = useRouter();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { addedLocations, removeLocation } = useLocations();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setName('위치 권한이 필요해요');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setCoords({ lat, lng });

      const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const place = places[0];
      setName(place ? `${place.city ?? ''} ${place.district ?? ''}`.trim() : '알 수 없는 위치');
    })();
  }, []);

  const goToDetail = (params: { name: string; lat: number; lng: number; region: string }) => {
    router.push({
      pathname: '/location-detail',
      params: {
        name: params.name,
        lat: String(params.lat),
        lng: String(params.lng),
        region: params.region,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.bigCloudLayer} pointerEvents="none">
        <Cloud delay={0} top={40} size={110} duration={26000} width={screenWidth} />
        <Cloud delay={5000} top={520} size={90} duration={32000} width={screenWidth} />
      </View>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>날씨</Text>
          <Pressable onPress={() => router.push('/location-search')}>
            <Text style={styles.addButton}>+</Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          {coords && (
            <LocationCard
              name={name}
              subtitle="나의 위치"
              lat={coords.lat ?? null}
              lng={coords.lng ?? null}
              onPress={() => goToDetail({ name, lat: coords.lat, lng: coords.lng, region: name })}
            />
          )}

          {addedLocations.map((loc) => (
            <LocationCard
              key={loc.id}
              name={loc.name}
              subtitle={loc.region}
              lat={loc.lat}
              lng={loc.lng}
              onPress={() => goToDetail({ name: loc.name, lat: loc.lat, lng: loc.lng, region: loc.region })}
              onDelete={() => removeLocation(loc.id)}
            />
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  bigCloudLayer: { ...StyleSheet.absoluteFillObject, opacity: 0.15 },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: { color: colors.textPrimary, fontSize: 32, fontWeight: '700' },
  addButton: { color: colors.accentBlue, fontSize: 28, fontWeight: '700' },
  list: { gap: 16 },
});