import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';

interface GradientOverlayProps {
    isDark: boolean;
    position?: 'top' | 'bottom';
    height?: number;
    style?: ViewStyle;
}

export function GradientOverlay({
    isDark,
    position = 'bottom',
    height = 200,
    style
}: GradientOverlayProps) {
    const darkColors: readonly [string, string, string] = [
        'transparent',
        'rgba(22,41,38,0.7)',
        'rgba(22,41,38,1)'
    ];

    const lightColors: readonly [string, string, string] = [
        'transparent',
        'rgba(240,244,248,0.7)',
        'rgba(240,244,248,1)'
    ];

    const colors = isDark ? darkColors : lightColors;
    const reversed: readonly [string, string, string] = [colors[2], colors[1], colors[0]];
    const orderedColors = position === 'bottom' ? colors : reversed;

    return (
        <LinearGradient
            colors={orderedColors}
            style={[
                styles.gradient,
                { height },
                position === 'top' ? styles.top : styles.bottom,
                style
            ]}
            pointerEvents="none"
        />
    );
}

const styles = StyleSheet.create({
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 10,
    },
    top: {
        top: 0,
    },
    bottom: {
        bottom: 0,
    },
});
