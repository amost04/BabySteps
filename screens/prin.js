import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, PixelRatio } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

// Función para normalizar tamaños según la pantalla
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

function normalize(size) {
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function PantallaPrincipal({ setPantalla }) {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground
                source={require('../assets/bw.png')}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.container}>
                    <Text style={styles.welcomeText}>Bienvenido</Text>
                    <TouchableOpacity
                        onPress={() => setPantalla('Inicio')}
                        activeOpacity={0.8}
                    >
                        <Animatable.Image
                            animation="bounceIn"
                            duration={3000}
                            source={require('../assets/bslogo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    welcomeText: {
        fontSize: normalize(36),
        color: '#fff',
        marginBottom: normalize(20),
        fontWeight: 'bold',
    },
    logo: {
        width: normalize(300),
        height: normalize(300),
    },
});
