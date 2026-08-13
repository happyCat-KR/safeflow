import { ActionGuideHeader } from '@/components/action-guide-header';
import { getActionGuideShelter, getActionGuideSteps, type Grade } from '@/constants/actionGuideData';
import { colors } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActionGuideResult() {
  const router = useRouter();
  const { situationCode, grade, address, score } = useLocalSearchParams<{
    situationCode?: string;
    grade?: Grade;
    address?: string;
    score?: string;
  }>();

  const steps = situationCode && grade ? getActionGuideSteps(situationCode, grade) : [];
  const showShelterButton = situationCode && grade ? getActionGuideShelter(situationCode, grade) : false;

  const handleShelter = () => {
    Alert.alert('준비 중', '주변 대피소 안내 기능은 준비 중입니다.');
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ActionGuideHeader address={address} score={score} />
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


        {showShelterButton && (
          <Pressable style={styles.shelterButton} onPress={handleShelter}>
            <Text style={styles.shelterButtonText}>📍 현재 위치 기준 대피소 확인하기</Text>
          </Pressable>
        )}

        <Pressable style={styles.homeButton} onPress={handleHome}>
          <Text style={styles.homeButtonText}>처음으로</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
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