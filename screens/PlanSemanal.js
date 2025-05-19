import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
  Alert,
  Modal,
} from 'react-native';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

const diasSemana = ['🐣 Lunes', '🧸 Martes', '🥣 Miércoles', '🎨 Jueves', '🎉 Viernes', '🌞 Sábado', '💤 Domingo'];

export default function ModalPlanSemanal({ visible, onClose }) {
  const [plan, setPlan] = useState([]);
  const uid = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    const fetchPlan = async () => {
      const db = getDatabase();
      const refPlan = ref(db, `usuarios/${uid}/planSemanal`);
      const snapshot = await get(refPlan);
      if (snapshot.exists()) {
        setPlan(snapshot.val());
      } else {
        setPlan(diasSemana.map(dia => ({ dia, desayuno: '', comida: '', cena: '', notas: '' })));
      }
    };
    fetchPlan();
  }, [uid]);

  const actualizarCampo = (index, campo, valor) => {
    const nuevoPlan = [...plan];
    nuevoPlan[index][campo] = valor;
    setPlan(nuevoPlan);
  };

  const guardarPlan = async () => {
    try {
      const db = getDatabase();
      const refPlan = ref(db, `usuarios/${uid}/planSemanal`);
      await set(refPlan, plan);
      Alert.alert('✅ Plan guardado', 'Tu plan semanal ha sido registrado correctamente.');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo guardar el plan.');
      console.error(error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <Text style={styles.titulo}>📅 Planificador Semanal</Text>
          <ScrollView contentContainerStyle={styles.scroll}>
            {plan.map((dia, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitulo}>{diasSemana[i] || dia.dia}</Text>

                <Text style={styles.etiqueta}>🍳 Desayuno</Text>
                <TextInput
                  placeholder="Desayuno"
                  style={styles.input}
                  value={dia.desayuno}
                  onChangeText={text => actualizarCampo(i, 'desayuno', text)}
                />

                <Text style={styles.etiqueta}>🍽️ Comida</Text>
                <TextInput
                  placeholder="Comida"
                  style={styles.input}
                  value={dia.comida}
                  onChangeText={text => actualizarCampo(i, 'comida', text)}
                />

                <Text style={styles.etiqueta}>🌙 Cena</Text>
                <TextInput
                  placeholder="Cena"
                  style={styles.input}
                  value={dia.cena}
                  onChangeText={text => actualizarCampo(i, 'cena', text)}
                />

                <Text style={styles.etiqueta}>📝 Notas</Text>
                <TextInput
                  placeholder="Notas (ej. no le gustó, repetir, etc.)"
                  style={styles.inputNota}
                  multiline
                  value={dia.notas}
                  onChangeText={text => actualizarCampo(i, 'notas', text)}
                />
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.btnGuardar} onPress={guardarPlan}>
            <Text style={styles.textoBtn}>Guardar Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnVolver} onPress={onClose}>
            <Text style={styles.textoBtn}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgb(247, 165, 13)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '95%',
    backgroundColor: '#f5f8ff',
    borderRadius: 15,
    marginTop: normalize(50),
    paddingHorizontal: normalize(15),
    paddingBottom: normalize(80),
  },
  titulo: {
    fontSize: normalize(26),
    fontWeight: 'bold',
    color: '#3e4a89',
    textAlign: 'center',
    marginTop: normalize(20),
    marginBottom: normalize(20),
  },
  scroll: {
    paddingBottom: normalize(30),
  },
  card: {
    backgroundColor: '#ffffffee',
    padding: normalize(15),
    borderRadius: 12,
    marginBottom: normalize(15),
    elevation: 2,
  },
  cardTitulo: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: normalize(10),
  },
  etiqueta: {
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 8,
    color: '#3e4a89',
    fontSize: normalize(14),
  },
  input: {
    backgroundColor: '#fff',
    padding: normalize(10),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: normalize(10),
  },
  inputNota: {
    backgroundColor: '#fff',
    padding: normalize(10),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    height: normalize(60),
    textAlignVertical: 'top',
  },
  btnGuardar: {
    backgroundColor: '#f76efc',
    padding: normalize(15),
    borderRadius: 10,
    position: 'absolute',
    bottom: normalize(80),
    left: normalize(20),
    right: normalize(20),
    alignItems: 'center',
  },
  btnVolver: {
    backgroundColor: '#ccc',
    padding: normalize(12),
    borderRadius: 10,
    position: 'absolute',
    bottom: normalize(30),
    left: normalize(20),
    right: normalize(20),
    alignItems: 'center',
  },
  textoBtn: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: normalize(16),
  },
});
