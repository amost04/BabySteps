import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image,
  TextInput, Alert, useWindowDimensions, Dimensions, PixelRatio
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { guardarSuenoAvanzado as guardarSueno } from '../FB/db_api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}


export default function Sueno({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();
  const [horaDormir, setHoraDormir] = useState('');
  const [horaDespertar, setHoraDespertar] = useState('');
  const [notas, setNotas] = useState('');

  const calcularHoras = (inicio, fin) => {
    try {
      const [h1, m1] = inicio.split(':').map(Number);
      const [h2, m2] = fin.split(':').map(Number);
      const d1 = new Date();
      const d2 = new Date();
      d1.setHours(h1, m1, 0);
      d2.setHours(h2, m2, 0);
      if (d2 < d1) d2.setDate(d2.getDate() + 1);
      return Math.round(((d2 - d1) / (1000 * 60 * 60)) * 100) / 100;
    } catch {
      return null;
    }
  };

  const guardarRegistro = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'No se ha iniciado sesión');
      return;
    }

    const horas = calcularHoras(horaDormir, horaDespertar);
    if (horas === null || horas <= 0) {
      Alert.alert('Error', 'Verifica los horarios ingresados');
      return;
    }

    const fecha = new Date().toISOString().split('T')[0];
    const exito = await guardarSueno(user.uid, fecha, horaDormir, horaDespertar, notas);
    if (exito) {
      setHoraDormir('');
      setHoraDespertar('');
      setNotas('');
      setPantalla('SuenoBebe'); // Redirige automáticamente a SuenoBebe
    } else {
      Alert.alert('Error', 'No se pudo guardar el registro');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/bw.png')}
      style={[styles.background, { width: wW, height: wH }]}
      resizeMode="cover"
    >
      <TouchableOpacity
        onPress={() => setPantalla('SuenoBebe')}
        style={styles.returnButton}
      >
        <Image
          source={require('../assets/return.png')}
          style={styles.returnIcon}
        />
      </TouchableOpacity>

      <View style={styles.overlay}>
        <Text style={styles.title}>Registrar Sueño</Text>
        <TextInput
          style={styles.input}
          placeholder="Hora de dormir (HH:mm)"
          value={horaDormir}
          onChangeText={setHoraDormir}
        />
        <TextInput
          style={styles.input}
          placeholder="Hora de despertar (HH:mm)"
          value={horaDespertar}
          onChangeText={setHoraDespertar}
        />
        <TextInput
          style={styles.input}
          placeholder="Notas"
          value={notas}
          onChangeText={setNotas}
        />
        <TouchableOpacity style={styles.button} onPress={guardarRegistro}>
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: normalize(20),
  },
  title: {
    fontSize: normalize(32),
    color: 'white',
    fontWeight: 'bold',
    marginBottom: normalize(20),
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
  input: {
    width: '80%',
    height: normalize(50),
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: normalize(15),
    marginBottom: normalize(15),
    backgroundColor: '#fff',
    fontSize: normalize(18),
  },
  button: {
    backgroundColor: '#6499fa',
    padding: normalize(12),
    borderRadius: 10,
    marginTop: normalize(10),
  },
  buttonText: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: 'bold'
  },
  resumen: {
    marginTop: normalize(30),
    alignItems: 'center'
  },
  info: {
    fontSize: normalize(16),
    color: 'white',
    marginVertical: normalize(3),
  }
});
