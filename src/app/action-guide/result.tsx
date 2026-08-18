import { ActionGuideHeader } from '@/components/action-guide-header';
import { getActionGuideShelter, getActionGuideSteps, type Grade } from '@/constants/actionGuideData';
import { colors } from '@/constants/colors';
import { FloodBackground } from '@/components/flood-background';
import { getNearestShelters } from '@/constants/shelters';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActionGuideResult() {
  const router = useRouter();
  const { situationCode, grade, address, score, lat, lng } = useLocalSearchParams<{
    situationCode?: string;
    grade?: Grade;
    address?: string;
    score?: string;
    lat?: string;
    lng?: string;
  }>();

  const steps = situationCode && grade ? getActionGuideSteps(situationCode, grade) : [];
  const showShelterButton = situationCode && grade ? getActionGuideShelter(situationCode, grade) : false;
  const [showShelters, setShowShelters] = useState(false);

  const nearestShelters = lat && lng ? getNearestShelters(Number(lat), Number(lng), 3) : [];

  const handleShelter = () => {
    setShowShelters(true);
  };

  const handleNavigate = (shelterLat: number, shelterLng: number, shelterName: string) => {
    router.push({
      pathname: '/map-view',
      params: {
        startLat: lat, startLng: lng, startLabel: address,
        shelters: JSON.stringify([{ name: shelterName, lat: shelterLat, lng: shelterLng }]),
        title: shelterName,
      },
    });
  };

  const handleShowAllOnMap = () => {
    router.push({
      pathname: '/map-view',
      params: {
        startLat: lat, startLng: lng, startLabel: address,
        shelters: JSON.stringify(nearestShelters.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng }))),
        title: '주변 대피소',
      },
    });
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      {grade && <FloodBackground grade={grade} />}
      <SafeAreaView style={styles.safeArea}>
        <ActionGuideHeader address={address} score={score} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>이렇게 행동하세요</Text>

        <View style={styles.cardList}>
          {steps.length > 0 ? (
            steps.map((step, index) => (
              <View key={index} style={styles.card}>
                {steps.length > 1 && <Text style={styles.cardNumber}>{index + 1}</Text>}
                <Text style={styles.cardText}>{step.replace(/^\d\)\s*/, '')}</Text>
              </View>
            ))
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardText}>해당 상황에 대한 안내를 준비 중입니다.</Text>
            </View>
          )}
        </View>


        {showShelterButton && !showShelters && (
          <Pressable style={styles.shelterButton} onPress={handleShelter}>
            <Text style={styles.shelterButtonText}>📍 현재 위치 기준 대피소 확인하기</Text>
          </Pressable>
        )}

        {showShelters && (
          <View style={styles.shelterSection}>
            <View style={styles.shelterSectionHeader}>
              <Text style={styles.shelterTitle}>🏠 주변 대피소</Text>
              {nearestShelters.length > 0 && (
                <Pressable style={styles.mapAllButton} onPress={handleShowAllOnMap}>
                  <Text style={styles.mapAllButtonText}>지도로 보기</Text>
                </Pressable>
              )}
            </View>
            {nearestShelters.length > 0 ? (
              nearestShelters.map((shelter) => (
                <View key={shelter.name} style={styles.shelterItem}>
                  <View style={styles.shelterInfo}>
                    <Text style={styles.shelterName}>{shelter.name}</Text>
                    <Text style={styles.shelterDistance}>
                      {shelter.distanceKm.toFixed(1)}km · {shelter.category || '대피시설'}
                    </Text>
                  </View>
                  <Pressable style={styles.navButton} onPress={() => handleNavigate(shelter.lat, shelter.lng, shelter.name)}>
                    <Text style={styles.navButtonText}>길찾기</Text>
                  </Pressable>
                </View>
              ))
            ) : (
              <Text style={styles.shelterEmpty}>주변 대피소 정보를 찾을 수 없어요.</Text>
            )}
          </View>
        )}
        </ScrollView>

        <Pressable style={styles.homeButton} onPress={handleHome}>
          <Text style={styles.homeButtonText}>처음으로</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700', marginTop: 20, marginBottom: 16 },
  cardList: { gap: 12 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 18, flexDirection: 'row', gap: 12 },
  cardNumber: { color: colors.accentTeal, fontSize: 16, fontWeight: '700' },
  cardText: { color: colors.textPrimary, fontSize: 15, lineHeight: 22, flex: 1 },
  shelterButton: {
    marginTop: 20,
    backgroundColor: colors.accentBlue,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shelterButtonText: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  shelterSection: { marginTop: 20 },
  shelterSectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  shelterTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  mapAllButton: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  mapAllButtonText: { color: colors.accentBlue, fontSize: 13, fontWeight: '700' },
  shelterItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 8,
  },
  shelterInfo: { flex: 1 },
  shelterName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  shelterDistance: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  shelterEmpty: { color: colors.textSecondary, fontSize: 13 },
  navButton: { backgroundColor: colors.accentBlue, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  navButtonText: { color: colors.background, fontSize: 13, fontWeight: '700' },
  homeButton: {
    marginTop: 'auto',
    marginBottom: 8,
    paddingTop: 20,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeButtonText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
});
