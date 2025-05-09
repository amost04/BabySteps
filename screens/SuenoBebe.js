import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image,
  ScrollView, useWindowDimensions, Dimensions, PixelRatio, TextInput, Alert
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { get, ref, getDatabase } from 'firebase/database';
import ModalSueno from './Sueno';

const coloresSueño = [
  '#ef4444', '#3b82f6', '#10b981',
  '#f59e0b', '#8b5cf6', '#ec4899',
  '#22d3ee', '#a855f7', '#84cc16'
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function SuenoBebe({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();
  const [registros, setRegistros] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  useEffect(() => {
    const unsubscribe = setTimeout(cargarDatos, 100);
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
  const eliminarRegistro = async (fecha, horaDormir) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
  
    const db = getDatabase();
    const path = `usuarios/${user.uid}/sueno/${fecha}`;
    const snapshot = await get(ref(db, path));
    if (!snapshot.exists()) return;
  
    const registrosFecha = snapshot.val();
    const clave = Object.keys(registrosFecha).find(id => registrosFecha[id].horaDormir === horaDormir);
  
    if (clave) {
      const registroRef = ref(db, `${path}/${clave}`);
      await registroRef.remove();
      cargarDatos(); // Refresca los datos después de borrar
    }
  };
  
  const fechasUnicas = [...new Set(registros.map(r => r.fecha))];
  const carpetasFiltradas = fechasUnicas.filter(fecha =>
    fecha.slice(5).includes(busqueda)
  );
  const registrosFiltrados = registros.filter(r =>
    (!fechaSeleccionada || r.fecha === fechaSeleccionada)
  );

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
  {/* Zona superior fija */}
  <View style={{ flex: 1 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: normalize(5) }}>
      {'Sueño de mi Bebé'.split('').map((letra, i) => (
        <Text key={`letra-${i}`} style={{ fontSize: normalize(36), fontWeight: 'bold', marginTop: normalize(22), color: coloresSueño[i % coloresSueño.length] }}>{letra}</Text>
      ))}
    </View>

    <Image source={require('../assets/sueno.png')} style={{ width: normalize(220), height: normalize(120), alignSelf: 'center', marginBottom: normalize(2) }} resizeMode="contain" />

    <TextInput
      style={{ backgroundColor: '#fff', borderRadius: 10, padding: normalize(7), marginBottom: normalize(5), fontSize: normalize(16) }}
      placeholder="Buscar por fecha (mm-dd)"
      value={busqueda}
      onChangeText={setBusqueda}
    />

<ScrollView horizontal contentContainerStyle={{ paddingBottom: normalize(10) }}>
  {carpetasFiltradas.map((fecha, index) => (
    <View key={index} style={{ alignItems: 'center', marginRight: normalize(12), width: normalize(95) }}>
      <TouchableOpacity onPress={() => setFechaSeleccionada(fecha)}>
        <Image
          source={require('../assets/carpeta.png')}
          style={{ width: normalize(95), height: normalize(90) }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text style={{ color: 'white', fontWeight: 'bold', marginTop: 4, textAlign: 'center', fontSize: normalize(12) }}>
        {fecha}
      </Text>
    </View>
  ))}
</ScrollView>
  </View>

  {/* Zona inferior scrollable */}
  <View style={{ flex: 1.2 }}>
    <ScrollView contentContainerStyle={{ paddingBottom: normalize(80) }}>
      {registrosFiltrados.map((item, index) => {
        let icono = '❓';
        let duracionTexto = 'No disponible';

        if (typeof item.duracion === 'string') {
          const match = item.duracion.match(/(\d+)h\s*(\d+)m/);
          if (match) {
            const horas = parseInt(match[1]);
            icono = horas < 6 ? '⚠️' : horas < 8 ? '😌' : '🌟';
            duracionTexto = item.duracion;
          }
        } else if (typeof item.duracion === 'number') {
          const horas = Math.floor(item.duracion);
          const minutos = Math.round((item.duracion - horas) * 60);
          icono = horas < 6 ? '⚠️' : horas < 8 ? '😌' : '🌟';
          duracionTexto = `${horas}h ${minutos}m`;
        }

        return (
          <View key={index} style={styles.card}>
            <Text style={styles.text}>📅 Fecha: {item.fecha}</Text>
            <Text style={styles.text}>🕓 Hora de dormir: {item.horaDormir}</Text>
            <Text style={styles.text}>🕘 Hora de despertar: {item.horaDespertar}</Text>
            <Text style={styles.text}>{icono} Duración: {duracionTexto}</Text>
            <Text style={styles.text}>📝 Notas: {item.notas}</Text>
            <TouchableOpacity
            onPress={() => {
             Alert.alert(
             '¿Eliminar registro?',
             'Esta acción no se puede deshacer. ¿Estás seguro?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                 text: 'Eliminar',
                style: 'destructive',
                  onPress: () => eliminarRegistro(item.fecha, item.horaDormir),
                },
              ],
              { cancelable: true }
            );
            }}
          style={{marginTop: normalize(8),backgroundColor: '#dc2626',padding: normalize(6),borderRadius: 6,}}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Eliminar</Text>
          </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>

    <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
      <Text style={styles.buttonText}>Agregar nuevo registro</Text>
    </TouchableOpacity>
  </View>
</View>

      {modalVisible && (
        <ModalSueno
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            cargarDatos();
          }}
        />
      )}
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
    padding: normalize(12),
    borderRadius: 10,
    alignItems: 'center',
    marginTop: normalize(10),
    marginBottom: normalize(10),
  },
  buttonText: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginBottom: normalize(10),
  },
});
