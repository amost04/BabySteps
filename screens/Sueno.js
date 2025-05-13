import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, TouchableOpacity,
  Dimensions, PixelRatio, useWindowDimensions, Alert
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { guardarSuenoAvanzado as guardarSueno } from '../FB/db_api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function ModalSueno({ visible, onClose }) {
  const { width: wW, height: wH } = useWindowDimensions();
  const [horaDormir, setHoraDormir] = useState('');
  const [horaDespertar, setHoraDespertar] = useState('');
  const [notas, setNotas] = useState('');

  const calcularDuracion = (inicio, fin) => {
    try {
      const [h1, m1] = inicio.split(':').map(Number);
      const [h2, m2] = fin.split(':').map(Number);
      const d1 = new Date();
      const d2 = new Date();
      d1.setHours(h1, m1, 0);
      d2.setHours(h2, m2, 0);
      if (d2 < d1) d2.setDate(d2.getDate() + 1);
      const diffMin = Math.floor((d2 - d1) / (1000 * 60));
      const horas = Math.floor(diffMin / 60);
      const minutos = diffMin % 60;
      return `${horas}h ${minutos}m`;
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

    const duracion = calcularDuracion(horaDormir, horaDespertar);
    if (!duracion) {
      Alert.alert('Error', 'Verifica los horarios ingresados');
      return;
    }

    const fecha = new Date().toISOString().split('T')[0];
    const exito = await guardarSueno(user.uid, fecha, horaDormir, horaDespertar, notas, duracion);
    if (exito) {
      setHoraDormir('');
      setHoraDespertar('');
      setNotas('');
      onClose();
    } else {
      Alert.alert('Error', 'No se pudo guardar el registro');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.background, { width: wW, height: wH }]}>
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
          <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: '#ccc', marginTop: 10 }]}>
            <Text style={[styles.buttonText, { color: '#333' }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(237, 166, 13, 0.86)' },
  overlay: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: normalize(20),
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    marginBottom: normalize(15),
    color: '#e653fd',
  },
  input: {
    width: '100%',
    height: normalize(50),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: normalize(15),
    marginBottom: normalize(15),
    backgroundColor: '#fff',
    fontSize: normalize(16),
  },
  button: {
    backgroundColor: '#219906',
    padding: normalize(12),
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
});
