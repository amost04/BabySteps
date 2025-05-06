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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const ConsejosPediatra = ({ visible, onClose }) => {
  const [tip, setTip] = useState('');
  const [advertencias, setAdvertencias] = useState([]);
  const [checklist, setChecklist] = useState({ manos: false, temp: false, supervision: false, sentado: false, alergias: false });
  const [plan, setPlan] = useState(null);
  const [fecha, setFecha] = useState('');
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
      get(ref(db, `usuarios/${uid}/planPediatra`)).then(snap => {
        if (snap.exists()) setPlan(snap.val());
      });
    }
  }, [visible]);

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const subirPlan = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true });
    if (!res.canceled) {
      if (!uid) return;
      const db = getDatabase();
      const nuevo = { uri: res.assets[0].uri, fecha };
      await set(ref(db, `usuarios/${uid}/planPediatra`), nuevo);
      setPlan(nuevo);
      Alert.alert('✅ Plan guardado');
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView style={styles.container}>
        <Text style={styles.title}>👩‍⚕️ Consejos del Pediatra</Text>

        {/* Checklist */}
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

        {/* Tip del Día */}
        <Text style={styles.sectionTitle}>💡 Tip del Día</Text>
        <Text style={styles.tip}>{tip}</Text>

        {/* Advertencias */}
        <Text style={styles.sectionTitle}>⚠️ Advertencias Comunes</Text>
        {advertencias.map((adv, i) => (
          <Text key={i} style={styles.warning}>• {adv}</Text>
        ))}

        {/* Plan del Pediatra */}
        <Text style={styles.sectionTitle}>📁 Plan del Pediatra</Text>
        {plan ? (
          <View style={styles.planBox}>
            <Image source={{ uri: plan.uri }} style={styles.planImage} />
            <Text style={{ textAlign: 'center' }}>📅 Fecha: {plan.fecha}</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <TextInput
              placeholder="Fecha (ej. 01/05/2025)"
              value={fecha}
              onChangeText={setFecha}
              style={styles.input}
            />
            <TouchableOpacity onPress={subirPlan} style={styles.btnUpload}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>📸 Subir Plan</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={onClose} style={styles.btnCerrar}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Cerrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: 'white' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  checkItem: { marginVertical: 5 },
  tip: { fontStyle: 'italic', marginBottom: 10 },
  warning: { marginBottom: 6 },
  planBox: { alignItems: 'center', marginTop: 10 },
  planImage: { width: 250, height: 250, resizeMode: 'contain', borderRadius: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  btnUpload: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnCerrar: { backgroundColor: '#6b7280', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
});

export default ConsejosPediatra;
