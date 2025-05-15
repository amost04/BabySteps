import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, useWindowDimensions, Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, update } from 'firebase/database';

// Cambia normalize para recibir el ancho
function normalize(size, SCREEN_WIDTH) {
  const scale = SCREEN_WIDTH / 375;
  const newSize = size * scale;
  return Math.round(newSize);
}

// Convierte string "10:30 a. m." a objeto Date
function stringToDate(timeStr) {
  if (!timeStr) return new Date();
  const [time, period] = timeStr.split(' ');
  let [hour, minute] = time.split(':').map(Number);
  if (period?.toLowerCase().includes('p') && hour < 12) hour += 12;
  if (period?.toLowerCase().includes('a') && hour === 12) hour = 0;
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

// Calcula duración entre dos objetos Date
function calcularDuracion(date1, date2) {
  let d1 = new Date(date1);
  let d2 = new Date(date2);
  if (d2 < d1) d2.setDate(d2.getDate() + 1);
  const diff = (d2 - d1) / 60000; // minutos
  const horas = Math.floor(diff / 60);
  const minutos = Math.round(diff % 60);
  return `${horas}h ${minutos}m`;
}

export default function EditarSuenoModal({ visible, onClose, registro, recargar }) {
  const { width: wW, height: wH } = useWindowDimensions();
  const [notas, setNotas] = useState('');
  const [horaDormir, setHoraDormir] = useState(new Date());
  const [horaDespertar, setHoraDespertar] = useState(new Date());
  const [showDormirPicker, setShowDormirPicker] = useState(false);
  const [showDespertarPicker, setShowDespertarPicker] = useState(false);

  useEffect(() => {
    setNotas(registro?.notas || '');
    setHoraDormir(registro?.horaDormir ? stringToDate(registro.horaDormir) : new Date());
    setHoraDespertar(registro?.horaDespertar ? stringToDate(registro.horaDespertar) : new Date());
  }, [registro]);

  const guardarCambios = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const horaDormirStr = horaDormir.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
    const horaDespertarStr = horaDespertar.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
    const duracion = calcularDuracion(horaDormir, horaDespertar);

    const db = getDatabase();
    const path = `usuarios/${user.uid}/sueno/${registro.fecha}/${registro.id}`;
    await update(ref(db, path), {
      horaDormir: horaDormirStr,
      horaDespertar: horaDespertarStr,
      notas,
      duracion
    });

    recargar();
    onClose();
    Alert.alert('Guardado', 'Cambios guardados correctamente.');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.background, { width: wW, height: wH }]}>
        <View style={styles.overlay}>
          <Text style={[styles.title, { fontSize: normalize(18, wW) }]}>Editar Registro de Sueño</Text>

          <Text style={{ alignSelf: 'flex-start', marginBottom: 5 }}>Hora de dormir</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDormirPicker(true)}
          >
            <Text style={{ color: '#000' }}>
              {horaDormir.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </Text>
          </TouchableOpacity>
          {showDormirPicker && (
            <DateTimePicker
              value={horaDormir}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={(event, selectedDate) => {
                setShowDormirPicker(false);
                if (selectedDate) setHoraDormir(selectedDate);
              }}
            />
          )}

          <Text style={{ alignSelf: 'flex-start', marginBottom: 5, marginTop: 10 }}>Hora de despertar</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDespertarPicker(true)}
          >
            <Text style={{ color: '#000' }}>
              {horaDespertar.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </Text>
          </TouchableOpacity>
          {showDespertarPicker && (
            <DateTimePicker
              value={horaDespertar}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={(event, selectedDate) => {
                setShowDespertarPicker(false);
                if (selectedDate) setHoraDespertar(selectedDate);
              }}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Notas"
            value={notas}
            onChangeText={setNotas}
          />
          <TouchableOpacity style={styles.button} onPress={guardarCambios}>
            <Text style={[styles.buttonText, { fontSize: normalize(16, wW) }]}>Guardar Cambios</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: '#ccc', marginTop: 10 }]}>
            <Text style={[styles.buttonText, { color: '#333', fontSize: normalize(16, wW) }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  overlay: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center'
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
