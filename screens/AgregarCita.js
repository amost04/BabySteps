// ModalAgregarCita.js
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  PixelRatio,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push } from 'firebase/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

const ModalAgregarCita = ({ visible, onClose, fechaSeleccionada, onGuardar }) => {
  const [horaSeleccionada, setHoraSeleccionada] = useState(new Date());
  const [showHoraPicker, setShowHoraPicker] = useState(false);
  const [lugar, setLugar] = useState('');
  const [notas, setNotas] = useState('');

  const guardarCita = async () => {
    if (!horaSeleccionada || !lugar) {
      Alert.alert("Campos requeridos", "Por favor completa la hora y el lugar.");
      return;
    }

    const nuevaCita = {
      fecha: fechaSeleccionada,
      hora: horaSeleccionada.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      lugar,
      notas
    };

    onGuardar(nuevaCita);

    // Guardar en Firebase
    const user = getAuth().currentUser;
    if (user) {
      const db = getDatabase();
      const refCitas = ref(db, `usuarios/${user.uid}/citasMedicas`);
      await push(refCitas, nuevaCita);
    }

    setHoraSeleccionada(new Date());
    setLugar('');
    setNotas('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.titulo}>Agendar Cita Médica</Text>

            <Text style={styles.label}>Fecha</Text>
            <TextInput style={styles.input} value={fechaSeleccionada} editable={false} />

            <Text style={styles.label}>Hora</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowHoraPicker(true)}>
              <Text>{horaSeleccionada.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
            {showHoraPicker && (
              <DateTimePicker
                value={horaSeleccionada}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowHoraPicker(false);
                  if (selectedDate) setHoraSeleccionada(selectedDate);
                }}
              />
            )}

            <Text style={styles.label}>Lugar</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del consultorio o dirección"
              value={lugar}
              onChangeText={setLugar}
              placeholderTextColor="#888"
            />

            <Text style={styles.label}>Notas</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Motivo de la cita, indicaciones, etc."
              value={notas}
              onChangeText={setNotas}
              placeholderTextColor="#888"
            />

            <TouchableOpacity style={styles.btnGuardar} onPress={guardarCita}>
              <Text style={styles.btnTexto}>Guardar Cita</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancelar} onPress={onClose}>
              <Text style={styles.btnTexto}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(77, 128, 142, 0.87)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '95%',
    backgroundColor: '#e3f9ff',
    borderRadius: 15,
    padding: normalize(20),
    elevation: 10,
    marginTop: normalize(110),
  },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    color: '#000'
  },
  btnGuardar: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  btnCancelar: {
    backgroundColor: '#E57373',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  btnTexto: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});

export default ModalAgregarCita;
