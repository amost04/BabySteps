// ConsejosPediatra.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  Dimensions,
  PixelRatio,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { getDatabase, ref, get, set, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import VisorImagenes from './VisorImagenes'; // ✅ Importación añadida

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

const ConsejosPediatra = ({ visible, onClose }) => {
  const [tip, setTip] = useState('');
  const [advertencias, setAdvertencias] = useState([]);
  const [verAdvertencias, setVerAdvertencias] = useState(false);
  const [checklist, setChecklist] = useState({ manos: false, temp: false, supervision: false, sentado: false, alergias: false });
  const [planes, setPlanes] = useState([]);
  const [fecha, setFecha] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [imagenExpandida, setImagenExpandida] = useState(null);
  const [imagenPreviaId, setImagenPreviaId] = useState(null);
  const [mostrarModalPlanes, setMostrarModalPlanes] = useState(false);
  const uid = getAuth().currentUser?.uid;

  useEffect(() => {
    if (visible && uid) {
      const db = getDatabase();
      get(ref(db, 'nutricion/tips')).then(snap => {
        if (snap.exists()) {
          const tips = Object.values(snap.val());
          const random = tips[Math.floor(Math.random() * tips.length)];
          setTip(random);
        }
      });
      get(ref(db, 'nutricion/advertencias')).then(snap => {
        if (snap.exists()) setAdvertencias(Object.values(snap.val()));
      });
      get(ref(db, `usuarios/${uid}/planesPediatra`)).then(snap => {
        if (snap.exists()) setPlanes(Object.entries(snap.val()).map(([id, data]) => ({ id, ...data })));
      });
    }
  }, [visible]);

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const pedirPermisoCamara = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permiso para usar la cámara');
      return false;
    }
    return true;
  };

  const subirPlan = async () => {
    if (!uid || !fecha.trim()) {
      Alert.alert('Error', 'Debes ingresar una fecha o nombre para el plan');
      return;
    }

    Alert.alert(
      'Seleccionar imagen o archivo',
      '¿Cómo quieres subir el archivo?',
      [
        {
          text: '📷 Cámara',
          onPress: async () => {
            const permiso = await pedirPermisoCamara();
            if (!permiso) return;
            const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
            if (!res.canceled) guardarArchivo(res.assets[0].uri);
          },
        },
        {
          text: '🖼 Galería',
          onPress: async () => {
            const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
            if (!res.canceled) guardarArchivo(res.assets[0].uri);
          },
        },
        {
          text: '📄 Archivos',
          onPress: async () => {
            const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
            if (res.assets && res.assets[0]) guardarArchivo(res.assets[0].uri);
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const guardarArchivo = async (uri) => {
    const db = getDatabase();
    const id = Date.now().toString();
    const nuevo = { uri, fecha };
    await set(ref(db, `usuarios/${uid}/planesPediatra/${id}`), nuevo);
    setPlanes(prev => [...prev, { id, ...nuevo }]);
    Alert.alert('✅ Plan guardado');
    setFecha('');
  };

  const eliminarPlan = async (id) => {
    const db = getDatabase();
    await remove(ref(db, `usuarios/${uid}/planesPediatra/${id}`));
    setPlanes(prev => prev.filter(p => p.id !== id));
  };

  const toggleImagen = (id) => {
    setImagenPreviaId(prev => prev === id ? null : id);
  };

  const planesFiltrados = planes.filter(p => p.fecha.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <>
      <Modal visible={visible} animationType="slide">
        <ScrollView style={styles.container}>
          <Text style={styles.title}>👩‍⚕️ Consejos del Pediatra</Text>
          <Text style={styles.sectionTitle}>✅ Checklist Pre-Comida</Text>
          {Object.entries({
            manos: 'Lavarse las manos',
            temp: 'Verificar temperatura de la comida',
            supervision: 'Supervisar al bebé al comer',
            sentado: 'Asegurarse que esté sentado',
            alergias: 'Confirmar que no hay alergias recientes',
          }).map(([key, label]) => (
            <TouchableOpacity key={key} onPress={() => toggleChecklist(key)} style={styles.checkItem}>
              <Text>{checklist[key] ? '☑️' : '⬜️'} {label}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.tipBox}>
            <Text style={styles.sectionTitle}>💡 Tip del Día</Text>
            <Text style={styles.tip}>{tip}</Text>
          </View>

          <TouchableOpacity onPress={() => setVerAdvertencias(!verAdvertencias)} style={styles.btnToggleAdvertencias}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{verAdvertencias ? 'Ocultar ⚠️ Advertencias' : 'Mostrar ⚠️ Advertencias'}</Text>
          </TouchableOpacity>
          {verAdvertencias && advertencias.map((adv, i) => (
            <Text key={i} style={styles.warning}>• {adv}</Text>
          ))}

          <TouchableOpacity onPress={() => setMostrarModalPlanes(true)} style={styles.btnUpload}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>📁 Ver Planes del Pediatra</Text>
          </TouchableOpacity>

          <Modal visible={mostrarModalPlanes} animationType="slide">
            <View style={{ flex: 1 }}>
              <ScrollView style={styles.container}>
                <Text style={styles.sectionTitle}>📤 Subir nuevo plan</Text>
                <TextInput placeholder="Fecha o nombre del plan" value={fecha} onChangeText={setFecha} style={styles.input} />
                <TouchableOpacity onPress={subirPlan} style={styles.btnUpload}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>📎 Subir</Text>
                </TouchableOpacity>
                <TextInput placeholder="🔍 Buscar plan por fecha" value={busqueda} onChangeText={setBusqueda} style={styles.input} />
                <Text style={styles.sectionTitle}>📅 Planes Subidos</Text>
                {planesFiltrados.map((p, i) => (
                  <View key={i}>
                    <TouchableOpacity style={styles.etapaBtn} onPress={() => toggleImagen(p.id)}>
                      <Text style={{ fontWeight: 'bold' }}>📅 {p.fecha}</Text>
                      <TouchableOpacity onPress={() => eliminarPlan(p.id)}>
                        <Text style={{ color: 'red' }}>🗑️</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                    {imagenPreviaId === p.id && (
                      <TouchableOpacity onPress={() => { setImagenExpandida(p.uri); }}>
                        <Image source={{ uri: p.uri }} style={styles.planImage} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity onPress={() => setMostrarModalPlanes(false)} style={styles.btnCerrar}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>❌ Cerrar</Text>
                </TouchableOpacity>
              </ScrollView>
              {imagenExpandida && (
                <VisorImagenes
                  visible={true}
                  imagenes={[{ uri: imagenExpandida }]}
                  indexInicial={0}
                  onClose={() => setImagenExpandida(null)}
                />
              )}
            </View>
          </Modal>

          <TouchableOpacity onPress={onClose} style={styles.btnCerrar}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Cerrar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#e0f7fa', marginTop: normalize(50) },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  checkItem: { marginVertical: 5 },
  tipBox: { backgroundColor: '#d0f0ff', borderRadius: 10, padding: 10, marginBottom: 10 },
  tip: { fontStyle: 'italic', color: '#333' },
  warning: { marginBottom: 6 },
  planImage: { width: 250, height: 250, resizeMode: 'contain', borderRadius: 10, alignSelf: 'center', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: 'white' },
  btnUpload: { backgroundColor: '#00bcd4', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  btnCerrar: { backgroundColor: '#607d8b', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnToggleAdvertencias: { backgroundColor: '#f97316', padding: 10, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  etapaBtn: { backgroundColor: '#ffffff', padding: 10, marginVertical: 5, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  overlayImageContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  overlayImage: { width: '95%', height: '90%', resizeMode: 'contain' },
  overlayCloseBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10000 },
});

export default ConsejosPediatra;
