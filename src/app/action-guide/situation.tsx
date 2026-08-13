import { ActionGuideHeader } from '@/components/action-guide-header';
import { colors } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const optionsByCategory = {
    building: [
        { label: '🕳️   지하 · 반지하', situationCode: 'building_basement' },
        { label: '1️⃣   저지대 · 1층', situationCode: 'building_lowfloor' },
    ],
    driving: [
        { label: '🚙   일반 도로 주행 중', situationCode: 'driving_normal' },
        { label: '🚧   지하차도 진입 · 갇힘', situationCode: 'driving_underpass' },
        { label: '🌊   차량이 침수되기 시작함', situationCode: 'driving_submerged' },
    ],
};

export default function ActionGuideSituation() {
    const router = useRouter();
    const { category, grade, address, score } = useLocalSearchParams<{
        category?: 'building' | 'driving';
        grade?: string;
        address?: string;
        score?: string;
    }>();
    const options = category ? optionsByCategory[category] : [];

    const handleSelect = (situationCode: string) => {
        router.push({ pathname: '/action-guide/result', params: { situationCode, grade, address, score } });
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ActionGuideHeader address={address} score={score} />

                {category === 'building' ? (
                    <>
                        <Text style={styles.title}>몇 층에 계신가요?</Text>
                        <Text style={styles.subtitle}>층수에 따라 위험도가 크게 달라집니다.</Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.title}>차량 상황을 알려주세요</Text>
                        <Text style={styles.subtitle}>상황에 따라 대처 방법이 완전히 달라집니다.</Text>
                    </>

                )}
                <View style={styles.list}>
                    {options.map((option) => (
                        <Pressable key={option.situationCode} style={styles.option} onPress={() => handleSelect(option.situationCode)}>
                            <Text style={styles.optionText}>{option.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
    title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: 24 },
    subtitle: { color: colors.textSecondary, fontSize: 13, marginTop:6, marginBottom: 12},
    list: { gap: 12 },
    option: { backgroundColor: colors.card, borderRadius: 14, paddingVertical: 18, paddingHorizontal: 16 },
    optionText: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
});