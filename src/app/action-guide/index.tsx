
import { ActionGuideHeader } from '@/components/action-guide-header';
import { FloodBackground } from '@/components/flood-background';
import { colors } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const topOptions = [
    { label: '건물 안', emoji: '🏠', category: 'building' as const },
    { label: '차량 이동 중', emoji: '🚗', category: 'driving' as const },
    { label: '도보 이동 중', emoji: '🚶', situationCode: 'walking' },
    { label: '주차 차량', emoji: '🅿️', situationCode: 'parked_vehicle' },
];

export default function ActionGuideStart() {
    const router = useRouter();
    const { grade, address, score, lat, lng } = useLocalSearchParams<{ grade?: string; address?: string; score?: string; lat?: string; lng?: string }>();

    const handleSelect = (option: (typeof topOptions)[number]) => {
        if (option.situationCode) {
            router.push({
                pathname: '/action-guide/result',
                params: { situationCode: option.situationCode, grade, address, score, lat, lng },
            });
        } else {
            router.push({
                pathname: '/action-guide/situation',
                params: { category: option.category, grade, address, score, lat, lng },
            });
        }
    };

    return (
        <View style={styles.container}>
            {(grade === 'caution' || grade === 'danger') && <FloodBackground grade={grade} />}
            <SafeAreaView style={styles.safeArea}>
                <ActionGuideHeader address={address} score={score} />
                <Text style={styles.title}>지금 어떤 상황이신가요?</Text>
                <Text style={styles.subtitle}>같은 지역이라도 상황에 따라 행동요령이 다릅니다.</Text>
                <View style={styles.grid}>
                    {topOptions.map((option) => (
                        <Pressable key={option.label} style={styles.tile} onPress={() => handleSelect(option)}>
                            <View style={styles.iconBox}>
                                <Text style={styles.icon}>{option.emoji}</Text>
                            </View>
                            <Text style={styles.tileLabel}>{option.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
    safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
    title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: 24 },
    subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 6, marginBottom: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    tile: { width: '47%', backgroundColor: colors.card, borderRadius: 20, paddingVertical: 24, alignItems: 'center', gap: 12 },
    iconBox: { width: 52, height: 52, borderRadius: 14, /* backgroundColor: 'rgba(255,255,255,0.06)', */ alignItems: 'center', justifyContent: 'center' },
    icon: { fontSize: 24 },
    tileLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
});