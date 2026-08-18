import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type WeatherState = 'clear' | 'light-rain' | 'heavy-rain';

function getWeatherState(rain: string | null): WeatherState {
    if (!rain) return 'clear';
    const num = parseFloat(rain);
    if (isNaN(num) || num <= 0) return 'clear';
    if (num < 50) return 'light-rain';
    return 'heavy-rain';
}

const gradients: Record<WeatherState, [string, string]> = {
    clear: ['#6EC6F5', '#BFE8FF'],
    'light-rain': ['#7C93A8', '#A8BAC9'],
    'heavy-rain': ['#3A4652', '#5C6B78'],
};

export function Cloud({ delay, top, size, duration, width }: { delay: number; top: number; size: number; duration: number; width: number }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        anim.setValue(0);
        const loop = Animated.loop(
            Animated.timing(anim, { toValue: 1, duration, delay, useNativeDriver: true })
        );
        loop.start();
        return () => loop.stop();
    }, [delay, duration, width]);

    const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-size, width + size],
    });

    return (
        <Animated.Text style={{ position: 'absolute', top, fontSize: size, opacity: 0.85, transform: [{ translateX }] }}>
            ☁️
        </Animated.Text>
    );
}

export function RainDrop({ left, delay, duration, height }: { left: number; delay: number; duration: number; height: number }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        anim.setValue(0);
        const loop = Animated.loop(
            Animated.timing(anim, { toValue: 1, duration, delay, useNativeDriver: true })
        );
        loop.start();
        return () => loop.stop();
    }, [delay, duration, height]);

    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, height] });
    const opacity = anim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.6, 0.6, 0] });

    return (
        <Animated.View
            style={{
                position: 'absolute', left, top: 0, width: 2, height: 14,
                backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 1,
                transform: [{ translateY }], opacity,
            }}
        />
    );
}

export function WeatherBackground({ rain, width, height }: { rain: string | null; width: number; height: number }) {
    const state = getWeatherState(rain);
    if (!width || !height) return null;

    const dropCount = state === 'heavy-rain' ? 10 : state === 'light-rain' ? 5 : 0;

    return (
        <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
            <LinearGradient colors={gradients[state]} style={StyleSheet.absoluteFill} />
            <Cloud delay={0} top={height * 0.15} size={height * 0.4} duration={9000} width={width} />
            <Cloud delay={1500} top={height * 0.5} size={height * 0.28} duration={13000} width={width} />
            <Cloud delay={3500} top={height * 0.3} size={height * 0.32} duration={11000} width={width} />
            {Array.from({ length: dropCount }).map((_, i) => (
                <RainDrop
                    key={i}
                    left={(width / dropCount) * i + (i % 3) * 8}
                    delay={i * 120}
                    duration={state === 'heavy-rain' ? 600 : 1000}
                    height={height}
                />
            ))}
        </View>
    );
}
