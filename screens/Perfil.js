import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, useWindowDimensions, Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function Perfil({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();

  return (
    <ImageBackground
      source={require('../assets/bw.png')}
      style={[styles.background, { width: wW, height: wH }]}
      resizeMode="cover"
    >
      <TouchableOpacity
        onPress={() => setPantalla('Home')}
        style={styles.returnButton}
      >
        <Image
          source={require('../assets/return.png')}
          style={styles.returnIcon}
        />
      </TouchableOpacity>

      <View style={styles.overlay}>
        <Text style={styles.title}>Pantalla: Perfil</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: normalize(32),
    color: 'white',
    fontWeight: 'bold',
  },
  returnButton: {
    position: 'absolute',
    top: normalize(40),
    left: normalize(20),
    zIndex: 10,
  },
  returnIcon: {
    width: normalize(40),
    height: normalize(40),
  },
});
