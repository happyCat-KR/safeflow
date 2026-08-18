import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, View } from 'react-native';
import { RainDrop } from './weather-background';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Grade = 'safe' | 'caution' | 'danger';

const gradientColors: Record<Grade, [string, string]> = {
    safe: ['transparent', 'transparent'],
    caution: ['rgba(61, 139, 245, 0)', 'rgba(61, 139, 245, 0.35)'],
    danger: ['rgba(20, 60, 110, 0)', 'rgba(20, 60, 110, 0.6)'],
};

export function FloodBackground({ grade }: { grade: Grade }) {
    if (grade === 'safe') return null;

    const dropCount = grade === 'danger' ? 16 : 6;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient colors={gradientColors[grade]} style={StyleSheet.absoluteFill} />
            {Array.from({ length: dropCount }).map((_, i) => (
                <RainDrop
                    key={i}
                    left={(screenWidth / dropCount) * i + (i % 3) * 8}
                    delay={i * 130}
                    duration={grade === 'danger' ? 650 : 1100}
                    height={screenHeight}
                />
            ))}
        </View>
    );
}
