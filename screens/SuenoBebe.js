import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image,
  ScrollView, useWindowDimensions, Dimensions, PixelRatio
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { get, ref, getDatabase } from 'firebase/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function SuenoBebe({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    const unsubscribe = setTimeout(cargarDatos, 100); // recarga al entrar
    return () => clearTimeout(unsubscribe);
  }, []);
  
  const cargarDatos = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
  
    const db = getDatabase();
    const path = `usuarios/${user.uid}/sueno`;
    const snapshot = await get(ref(db, path));
    if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = [];
      
        Object.entries(data).forEach(([fecha, registrosPorFecha]) => {
          Object.entries(registrosPorFecha).forEach(([id, valores]) => {
            arr.push({
              fecha,
              ...valores
            });
          });
        });
      
        setRegistros(arr.reverse());
      }
      
  };
  
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
        <Text style={styles.title}>Sueño de mi Bebé</Text>

        <ScrollView style={styles.scroll}>
            {registros.map((item, index) => {
               const duracion = parseFloat(item.duracion);
               const icono = duracion < 6 ? '⚠️' : duracion < 8 ? '😌' : '🌟';

               return (
                 <View key={index} style={styles.card}>
                     <Text style={styles.text}>📅 Fecha: {item.fecha}</Text>
                     <Text style={styles.text}>🕓 Hora de dormir: {item.horaDormir}</Text>
                     <Text style={styles.text}>🕘 Hora de despertar: {item.horaDespertar}</Text>
                     <Text style={styles.text}>{icono} Duración: {duracion.toFixed(2)} horas</Text>
                     <Text style={styles.text}>📝 Notas: {item.notas}</Text>
                 </View>);
                })}
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={() => setPantalla('Sueno')}>
          <Text style={styles.buttonText}>Agregar nuevo registro</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    paddingHorizontal: normalize(20),
    paddingTop: normalize(60),
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: normalize(28),
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: normalize(10),
    textAlign: 'center'
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
  scroll: {
    flex: 1,
    marginBottom: normalize(10),
  },
  card: {
    backgroundColor: '#ffffffaa',
    borderRadius: 10,
    padding: normalize(15),
    marginVertical: normalize(8),
  },
  text: {
    fontSize: normalize(16),
    color: '#000',
    marginVertical: 2,
  },
  button: {
backgroundColor: '#fdb053',
padding: normalize(20),
borderRadius: 10,
alignItems: 'center',
marginTop: normalize(10),
marginBottom: normalize(5), // Reducir el margen inferior para mover el botón hacia arriba
  },
  buttonText: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: 'bold',
  },
});
