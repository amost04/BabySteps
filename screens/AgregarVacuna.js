// AgregarVacuna.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  PixelRatio,
  Alert,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import vacunasData from './vacunas_bebes_mexico.json';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

function getFechaLocal(date) {
  const fechaLocal = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return fechaLocal.toISOString().split('T')[0];
}

const vacunasOficiales = [
  "BCG",
  "Hepatitis B",
  "Hexavalente",
  "DPT",
  "Rotavirus",
  "Neumocócica conjugada",
  "SRP (Triple viral)",
  "Influenza",
  "COVID-19",
  "Otra vacuna"
];

const AgregarVacuna = ({ visible, onClose, onGuardar, fechaPredeterminada }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(fechaPredeterminada ? new Date(fechaPredeterminada) : new Date());
  const [notas, setNotas] = useState('');
  const [imagen, setImagen] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const elegirImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
    if (!result.canceled) setImagen(result.assets[0].uri);
  };

  const tomarFoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso requerido", "Se necesita permiso para usar la cámara.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
    if (!result.canceled) setImagen(result.assets[0].uri);
  };

  const guardar = async () => {
    if (!nombre || !descripcion || !fecha) return Alert.alert("Campos incompletos", "Por favor llena todos los campos obligatorios");
    onGuardar({ nombre, descripcion, fecha: getFechaLocal(fecha), notas, imagen });
    setNombre(''); setDescripcion(''); setFecha(new Date()); setNotas(''); setImagen(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titulo}>Registrar Vacuna</Text>

          <Text style={styles.label}>Nombre de la vacuna</Text>
          <TextInput
            style={styles.input}
            placeholder="Selecciona o escribe"
            value={nombre}
            onChangeText={setNombre}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.opcionesScroll}>
            {vacunasOficiales.map((v, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setNombre(v);
                  const vacunaInfo = vacunasData.find(vac => vac.nombre === v);
                  if (vacunaInfo) {
                    setDescripcion(vacunaInfo.descripcion);
                  } else {
                    setDescripcion('');
                  }
                }}
                style={styles.opcionVacuna}
              >
                <Text>{v}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Descripción breve</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Previene tuberculosis..."
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <Text style={styles.label}>Fecha</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
            <Text>{fecha.toLocaleDateString('es-MX')}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={fecha}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  const fixedDate = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate()
                  );
                  setFecha(fixedDate);
                }
              }}
            />
          )}

          <Text style={styles.label}>Notas</Text>
          <TextInput
            style={[styles.input, { height: 80 }]} multiline
            placeholder="Observaciones, Numero de Dosis..."
            value={notas}
            onChangeText={setNotas}
          />

          <TouchableOpacity style={styles.btnImagen} onPress={elegirImagen}>
            <Text style={styles.btnTexto}>Elegir de Galería</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnImagen} onPress={tomarFoto}>
            <Text style={styles.btnTexto}>Tomar Foto</Text>
          </TouchableOpacity>

          {imagen && <Image source={{ uri: imagen }} style={styles.imagen} />}

          <TouchableOpacity style={styles.btnGuardar} onPress={guardar}>
            <Text style={styles.btnTexto}>Guardar Vacuna</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancelar} onPress={onClose}>
            <Text style={styles.btnTexto}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    backgroundColor: '#f5f8ff',
    borderRadius: 15,
    padding: normalize(15),
    alignSelf: 'center',
  },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#444' },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 5 },
  opcionesScroll: { marginVertical: 10 },
  opcionVacuna: { backgroundColor: '#E0F7FA', padding: 10, marginRight: 10, borderRadius: 10 },
  btnImagen: { backgroundColor: '#64B5F6', padding: 10, borderRadius: 8, marginTop: 10 },
  imagen: { height: 200, resizeMode: 'contain', marginVertical: 10 },
  btnGuardar: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, marginTop: 20 },
  btnCancelar: { backgroundColor: '#E57373', padding: 15, borderRadius: 8, marginTop: 10 },
  btnTexto: { color: 'white', textAlign: 'center', fontWeight: 'bold' }
});

export default AgregarVacuna;
