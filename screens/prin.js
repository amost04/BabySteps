import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity,
  Dimensions, PixelRatio, useWindowDimensions
} from 'react-native';
import { Video } from 'expo-av';
import * as Animatable from 'react-native-animatable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 350;

function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function Prin({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();
  const [videoTerminado, setVideoTerminado] = useState(false);

  return (
    <View style={[styles.background, { width: wW, height: wH }]}>
      {!videoTerminado ? (
        <View style={styles.videoContainer}>
          <Video
            source={require('../assets/video.mp4')}
            style={{ width: wW, height: wH }} // Ajustar al tamaño de la pantalla
            resizeMode="cover" // Cambiar a "cover" para que ocupe toda la pantalla
            shouldPlay
            isLooping={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) setVideoTerminado(true);
            }}
          />
        </View>
      ) : (
        <ImageBackground
          source={require('../assets/bw.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <TouchableOpacity onPress={() => setPantalla('Inicio')} activeOpacity={0.8}>
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  video: {
    // Se eliminan las dimensiones fijas para evitar conflictos
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
