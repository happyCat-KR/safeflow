import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  address?: string;
  score?: string;
};

export function ActionGuideHeader({ address, score }: Props) {
  const router = useRouter();
  return (
    <View>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>‹ 뒤로</Text>
        </Pressable>
        <Text style={styles.logo}>≋ SafeFlow</Text>
      </View>
      {!!address && !!score && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>📍 {address} · 위험도 {score}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  logo: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  badge: { marginTop: 16 },
  badgeText: { color: colors.accentTeal, fontSize: 13, fontWeight: '600' },
});