import React, { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import {
  View, StyleSheet, ImageBackground, Image, TouchableOpacity, Text,
  useWindowDimensions, Dimensions, PixelRatio, ScrollView, Modal, Button,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import RegistroBiome from './registroBiome';
import GraficaBiometrica from './GraficaBiometrica';
import EscalaWongBaker from './EscalaWongBaker';
import NotasChecklist from './NotasChecklist';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

const logoNombre = require('../assets/bsnombre.png');


export default function Home({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();
  const [datosGrafica, setDatosGrafica] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [semanaActual, setSemanaActual] = useState(0);
  const [planDia, setPlanDia] = useState(null);

  const cargarPlanDelDia = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getDatabase();
    const path = `usuarios/${user.uid}/planSemanal`;
    const snapshot = await get(ref(db, path));

    if (snapshot.exists()) {
      const data = snapshot.val();
      const jsDay = new Date().getDay(); // 0=domingo
      // const diaIndex = jsDay === 0 ? 6 : jsDay - 1; // 0=domingo → 6, 1=lunes → 0, ..., 6=sábado → 5
      const diaIndex = jsDay === 0 ? 6 : jsDay - 1;
      const planDelDia = data[diaIndex];


      if (planDelDia) {
        setPlanDia(planDelDia);
      } else {
        setPlanDia(null);
      }
    } else {
      setPlanDia(null);
    }
  };
  useEffect(() => {
    cargarDatosSueno();
    cargarPlanDelDia(); // esta línea es nueva
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

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diaSemanaActual = hoy.getDay();
  const offset = diaSemanaActual === 0 ? -6 : 1 - diaSemanaActual;

  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() + offset - semana * 7);

  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);

  registros.forEach((registro) => {
    const fecha = new Date(registro.fecha + 'T12:00'); // <- fix importante
    fecha.setHours(0, 0, 0, 0);

    if (fecha >= inicioSemana && fecha <= finSemana) {
      const diaSemana = fecha.getDay(); // 0 = domingo
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
        color: () => '#fcaa61',
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
  function obtenerDiaActual() {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    return dias[new Date().getDay()];
  }

  return (
    <ImageBackground
      source={require('../assets/bw.png')}
      style={[styles.background, { width: wW, height: wH }]}
      resizeMode="cover"
    >

      <View style={styles.overlay}>
            <Image source={logoNombre} style={{ width: normalize(350), height: normalize(150), resizeMode: 'contain', alignSelf: 'center', marginTop: normalize(80) }}/>
        <ScrollView contentContainerStyle={{ paddingBottom: 100, marginBottom:40 }} horizontal>
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
                      color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: { borderRadius: 16 },
                      propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: '#fcaa61',
                      },
                    }}
                    bezier
                    style={{ marginVertical: 8, borderRadius: 16 }}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Plan Nutricional de Hoy</Text>
              <View style={{ backgroundColor: '#ffcef8', borderRadius: 12, padding: 10, marginTop: 10, alignSelf: 'center',maxWidth: '80%',width: '95%' }}>
                <Text style={{ fontSize: normalize(24), fontWeight: 'bold', marginBottom: 6 }}>📅 Día actual:</Text>
                <Text style={{ fontSize: normalize(21), marginBottom: 6, fontWeight: 'bold' }}>{obtenerDiaActual()}</Text>

                {planDia ? (
                  <>
                    <Text style={{fontSize: normalize(20)}}>🍳 Desayuno: {planDia.desayuno}</Text>
                    <Text style={{fontSize: normalize(20)}}>🍽️ Comida: {planDia.comida}</Text>
                    <Text style={{fontSize: normalize(20)}}>🌙 Cena: {planDia.cena}</Text>
                    <Text style={{fontSize: normalize(20)}}>📝 Notas: {planDia.notas}</Text>
                  </>
                ) : (
                  <Text style={{ fontStyle: 'italic' }}>No hay plan registrado para hoy.</Text>
                )}
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Evolución biométrica</Text>
              <GraficaBiometrica />
            </View>
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>📝 Mis Notas</Text>  
              <NotasChecklist />
            </View>

            
          </View>
        </ScrollView>
<EscalaWongBaker />

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
                  color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: '#fcaa61',
                  },
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 16 }}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setSemanaActual(semanaActual + 1)}>
                <Text style={styles.modalButtonText}>Semana anterior</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
              {semanaActual > 0 && (
                <TouchableOpacity onPress={() => setSemanaActual(semanaActual - 1)}>
                  <Text style={styles.modalButtonText}>Semana siguiente</Text>
                </TouchableOpacity>
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
    flexDirection: 'row',
    marginTop: normalize(40), // bajarlas más
    paddingHorizontal: normalize(20),
    gap: normalize(20), // espacio horizontal entre tarjetas (usa gap si tu versión de RN lo permite)
  },
  chartContainer: {
    // reemplaza el style chartContainer por este

    chartContainer: {
      backgroundColor: '#fff',
      borderRadius: normalize(16),
      padding: normalize(10),
      marginHorizontal: normalize(20),
      marginBottom: normalize(10),
      marginTop: normalize(10),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      width: normalize(300),
      height: normalize(280),
      justifyContent: 'flex-start',
    },

  },
  chartTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(238, 88, 183, 0.64)',
    borderRadius: normalize(6),
    alignSelf: 'center',
    marginBottom: 0,
    color: 'Black',
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
    backgroundColor: 'rgba(0, 0, 0, 0.79)',
  },
  modalContent: {
    bbackgroundColor: '#fff',
    borderRadius: normalize(20),
    padding: normalize(20),
    width: normalize(350),
    height: normalize(400),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  modalTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#eb61fc',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    color: '#eb61fc',
  },
  modalButtonText: {
    color: '#ec4899',
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginHorizontal: normalize(10),
  },


});
