import React from 'react';
import {
  View, StyleSheet, ImageBackground, Image, TouchableOpacity, Text,
  useWindowDimensions, Dimensions, PixelRatio
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function Home({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();

  const botones = [
    { nombre: 'Nutrición', pantalla: 'Nutricion', icono: require('../assets/nutri.png') },
    { nombre: 'Sueño', pantalla: 'Sueno', icono: require('../assets/sueno.png') },
    { nombre: 'Perfil', pantalla: 'Perfil', icono: require('../assets/perfil.png') },
    { nombre: 'Cartilla', pantalla: 'CitasCartilla', icono: require('../assets/cita.png') },
    { nombre: 'FAQ', pantalla: 'FAQ', icono: require('../assets/faq.png') },
  ];

  return (
    <ImageBackground
      source={require('../assets/bw.png')}
      style={[styles.background, { width: wW, height: wH }]}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          {botones.map((btn, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.buttonContainer, btn.nombre === 'Perfil' && styles.perfil ]}
              onPress={() =>{   
                 console.log("Presionaste:", btn.pantalla);
                 setPantalla(btn.pantalla);}}
            >
              <Image source={btn.icono} style={styles.icono} resizeMode="contain" />
              <Text style={styles.buttonText}>{btn.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Image
          //source={require('../assets/bslogo.png')}
          //style={styles.logo}
          //resizeMode="contain"
          //pointerEvents="none" // 👈 Esto permite que los toques pasen a lo de abajo
        />
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
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sidebar: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingLeft: normalize(15),
    paddingVertical: normalize(50),
  },
  buttonContainer: {
    marginVertical: normalize(5),
    alignItems: 'center',
  },
  perfil: {
    marginVertical: normalize(20),
  },
  icono: {
    width: normalize(100),
    height: normalize(100),
    marginBottom: normalize(3),
  },
  buttonText: {
    color: 'white',
    fontSize: normalize(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logo: {
    width: normalize(500),
    height: normalize(500),
    //position: 'center', 
    left: normalize(-50),
    top: normalize(150),
    bottom: normalize(50),
    right: normalize(30),
  },
});
