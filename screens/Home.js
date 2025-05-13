import React, { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import {
  View, StyleSheet, ImageBackground, Image, TouchableOpacity, Text,
  useWindowDimensions, Dimensions, PixelRatio, ScrollView, Modal, Button,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function Home({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();
  const [datosGrafica, setDatosGrafica] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [semanaActual, setSemanaActual] = useState(0); // Semana actual (0 = esta semana)

  useEffect(() => {
    cargarDatosSueno();
  }, [semanaActual]);

  const cargarDatosSueno = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getDatabase();
    const path = `usuarios/${user.uid}/sueno`;
    const snapshot = await get(ref(db, path));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const registros = [];

      Object.entries(data).forEach(([fecha, registrosPorFecha]) => {
        Object.entries(registrosPorFecha).forEach(([id, valores]) => {
          registros.push({
            fecha,
            ...valores,
          });
        });
      });

      setDatosGrafica(procesarDatosGrafica(registros.reverse(), semanaActual));
    }
  };

  const procesarDatosGrafica = (registros, semana) => {
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const horasPorDia = Array(7).fill(0);

    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay() - semana * 7);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(finSemana.getDate() + 6);

    registros.forEach((registro) => {
      const fecha = new Date(registro.fecha);
      if (fecha >= inicioSemana && fecha <= finSemana) {
        const diaSemana = fecha.getDay();
        const duracion = registro.duracion.match(/(\d+)h\s*(\d+)m/);
        if (duracion) {
          const horas = parseInt(duracion[1]);
          const minutos = parseInt(duracion[2]) / 60;
          horasPorDia[diaSemana === 0 ? 6 : diaSemana - 1] += horas + minutos;
        }
      }
    });

    return {
      labels: diasSemana,
      datasets: [
        {
          data: horasPorDia,
          color: () => '#3b82f6',
          strokeWidth: 2,
        },
      ],
    };
  };

  const botones = [
    { nombre: 'Nutrición', pantalla: 'Nutricion', icono: require('../assets/nutri.png') },
    { nombre: 'Sueño', pantalla: 'SuenoBebe', icono: require('../assets/sueno.png') },
    { nombre: 'Perfil', pantalla: 'Perfil', icono: require('../assets/perfil.png') },
    { nombre: 'Cartilla', pantalla: 'CitasCartilla', icono: require('../assets/cita.png') },
    { nombre: 'FAQ', pantalla: 'FAQ', icono: require('../assets/faq.png') },
  ];

  return (
    <ImageBackground
      source={require('../assets/bw.png')}
      style={[styles.background, { width: wW, height: wH }]}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Horas de sueño semanal</Text>
            {datosGrafica && (
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <LineChart
                  data={datosGrafica}
                  width={SCREEN_WIDTH - 40}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                      stroke: '#3b82f6',
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.bottomBar}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {botones.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.buttonContainer, btn.nombre === 'Perfil' && styles.perfil]}
                onPress={() => {
                  console.log("Presionaste:", btn.pantalla);
                  setPantalla(btn.pantalla);
                }}
              >
                <Image source={btn.icono} style={styles.icono} resizeMode="contain" />
                <Text style={styles.buttonText}>{btn.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Modal para semanas anteriores */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gráficas de semanas anteriores</Text>
            {datosGrafica && (
              <LineChart
                data={datosGrafica}
                width={SCREEN_WIDTH - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: '#3b82f6',
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            )}
            <View style={styles.modalButtons}>
              <Button title="Semana anterior" onPress={() => setSemanaActual(semanaActual + 1)} />
              <Button title="Cerrar" onPress={() => setModalVisible(false)} />
              {semanaActual > 0 && (
                <Button title="Semana siguiente" onPress={() => setSemanaActual(semanaActual - 1)} />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  chartTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#3b82f6',
  },
  bottomBar: {
    height: normalize(100),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: normalize(10),
    marginBottom: normalize(35),
  },
  buttonContainer: {
    marginHorizontal: normalize(10),
    alignItems: 'center',
    width: normalize(80),
  },
  perfil: {
    marginVertical: normalize(10),
  },
  icono: {
    width: normalize(60),
    height: normalize(60),
    marginBottom: normalize(3),
  },
  buttonText: {
    color: 'white',
    fontSize: normalize(12),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3b82f6',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
