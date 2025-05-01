import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Dimensions,
  PixelRatio,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import ModalPlanSemanal from './PlanSemanal';
import BuscadorAlim from './BuscadorAlim';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function Nutricion({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalPlanVisible, setModalPlanVisible] = useState(false);
  const [modalBuscadorVisible, setModalBuscadorVisible] = useState(false);
  const [etapas, setEtapas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    const fetchEtapas = async () => {
      const db = getDatabase();
      const refEtapas = ref(db, 'nutricion/etapas');
      const snapshot = await get(refEtapas);
      if (snapshot.exists()) {
        const datos = snapshot.val();
        setEtapas(Object.values(datos));
      }
      setCargando(false);
    };
    fetchEtapas();
  }, []);

  const indiceActual = etapas.findIndex((e) => e.edad === seleccionada?.edad);
  const etapaAnterior = () => {
    if (indiceActual > 0) setSeleccionada(etapas[indiceActual - 1]);
  };
  const etapaSiguiente = () => {
    if (indiceActual < etapas.length - 1) setSeleccionada(etapas[indiceActual + 1]);
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Nutrición del Bebé</Text>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>🍼 Guía por Edad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalPlanVisible(true)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>📅 Plan Semanal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalBuscadorVisible(true)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>🔍 Buscador de Alimentos</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🚨 Registro de Alergias</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>👩‍⚕️ Consejos del Pediatra</Text>
          </View>
        </ScrollView>
      </View>

      <ModalPlanSemanal visible={modalPlanVisible} onClose={() => setModalPlanVisible(false)} />

      <BuscadorAlim visible={modalBuscadorVisible} onClose={() => setModalBuscadorVisible(false)} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Guía por Edad</Text>
            {cargando ? (
              <ActivityIndicator size="large" color="#4a90e2" />
            ) : (
              etapas.map((et, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    setModalVisible(false);
                    setSeleccionada(et);
                  }}
                  style={styles.etapaBtn}
                >
                  <Text style={styles.etapaText}>{et.edad}</Text>
                </Pressable>
              ))
            )}
            <Pressable style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>❌ Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {seleccionada && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={true}
          onRequestClose={() => setSeleccionada(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{seleccionada.edad}</Text>
              <Text style={styles.modalSub}>🧠 {seleccionada.recomendacion}</Text>
              <Text style={styles.modalSub}>🍽 Menú sugerido:</Text>
              {seleccionada.menu &&
                Object.values(seleccionada.menu).map((m, i) => (
                  <Text key={i} style={styles.modalItem}>• {m}</Text>
                ))}
              <Text style={styles.modalSub}>⚠️ Alertas:</Text>
              {seleccionada.alertas &&
                Object.values(seleccionada.alertas).map((a, i) => (
                  <Text key={i} style={styles.modalItem}>• {a}</Text>
                ))}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: normalize(15) }}>
                <Pressable
                  onPress={etapaAnterior}
                  style={[styles.modalClose, { flex: 0.45 }]}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Anterior</Text>
                </Pressable>
                <Pressable
                  onPress={etapaSiguiente}
                  style={[styles.modalClose, { flex: 0.45 }]}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Siguiente</Text>
                </Pressable>
              </View>
              <Pressable
                style={[styles.modalClose, { marginTop: normalize(10) }]}
                onPress={() => setSeleccionada(null)}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Volver</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  scrollContent: { padding: normalize(20), paddingTop: normalize(70) },
  title: { fontSize: normalize(28), color: 'white', fontWeight: 'bold', textAlign: 'center', marginBottom: normalize(20) },
  card: { backgroundColor: '#ffffffdd', padding: normalize(15), borderRadius: 12, marginBottom: normalize(15) },
  cardTitle: { fontSize: normalize(18), fontWeight: 'bold', marginBottom: normalize(5) },
  returnButton: { position: 'absolute', top: normalize(40), left: normalize(20), zIndex: 10 },
  returnIcon: { width: normalize(40), height: normalize(40) },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 15, padding: normalize(20), elevation: 6 },
  modalTitle: { fontSize: normalize(20), fontWeight: 'bold', textAlign: 'center', color: '#4a90e2', marginBottom: normalize(10) },
  etapaBtn: { backgroundColor: '#f0f0f0', padding: normalize(10), marginVertical: 5, borderRadius: 8 },
  etapaText: { fontSize: normalize(16), fontWeight: 'bold' },
  modalClose: { backgroundColor: '#4a90e2', padding: normalize(10), marginTop: normalize(10), borderRadius: 8, alignItems: 'center' },
  modalSub: { marginTop: normalize(10), fontWeight: 'bold' },
  modalItem: { fontSize: normalize(14), marginLeft: 10 },
});
