import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, PixelRatio, useWindowDimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';


// Función para normalizar tamaños según la pantalla
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 350;

function normalize(size) {
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function Prin({ setPantalla }) {
    const { width: wW, height: wH } = useWindowDimensions();

    return (
            <ImageBackground
                source={require('../assets/bw.png')}
                style={[styles.background, { width: wW, height: wH }]}
                
            >
                <View style={styles.overlay}>
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
            </ImageBackground>)
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    overlay: {
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
        width: normalize(400),
        height: normalize(400),
    },
});
