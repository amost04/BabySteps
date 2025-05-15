// CitasCartilla.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  PixelRatio
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AgregarVacuna from './AgregarVacuna';
import VisualizarFotoCartilla from './VisualizarFotoCartilla';
import AgregarCita from './AgregarCita';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import vacunasData from './vacunas_bebes_mexico.json';

// Normalización responsiva
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

// Calendario en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

const CitasCartilla = ({ setPantalla }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCitaVisible, setModalCitaVisible] = useState(false);
  const [vacunas, setVacunas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [modalFoto, setModalFoto] = useState({ visible: false, imagen: null });

  const handleDayPress = (day) => {
    setFechaSeleccionada(day.dateString);
    setModalCitaVisible(true);
  };

  const handleAgregarVacuna = (vacunaNueva) => {
    setVacunas([...vacunas, vacunaNueva]);
  };

  const handleAgregarCita = (citaNueva) => {
    setCitas([...citas, citaNueva]);
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const db = getDatabase();

      // Vacunas
      const refVacunas = ref(db, `usuarios/${user.uid}/vacunas`);
      onValue(refVacunas, (snapshot) => {
        const data = snapshot.val();
        const lista = data ? Object.values(data) : [];
        setVacunas(lista);
      });

      // Citas
      const refCitas = ref(db, `usuarios/${user.uid}/citasMedicas`);
      onValue(refCitas, (snapshot) => {
        const data = snapshot.val();
        const lista = data ? Object.values(data) : [];
        setCitas(lista);
      });
    }
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setPantalla('Home')} style={styles.returnButton}>
        <Image source={require('../assets/return.png')} style={styles.returnIcon} />
      </TouchableOpacity>

      <Text style={styles.title}>Citas Medicas y Cartilla de Vacunación</Text>

      <View style={styles.calendarioContainer}>
        <Calendar onDayPress={handleDayPress} />
      </View>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.btnAgregar}
      >
        <Text style={styles.txtBtn}>Agregar Vacuna</Text>
      </TouchableOpacity>

      <ScrollView>
        <Text style={styles.subtitulo}>Vacunas Registradas:</Text>
        {vacunas.map((v, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.nombreVacuna}>{v.nombre}</Text>
            <Text style={styles.descripcion}>{v.descripcion}</Text>
            <Text style={styles.fecha}>Fecha: {v.fecha}</Text>
            {v.notas && <Text style={styles.notas}>Notas: {v.notas}</Text>}
            {v.imagen && (
              <TouchableOpacity onPress={() => setModalFoto({ visible: true, imagen: v.imagen })}>
                <Text style={styles.verFoto}>Ver Foto</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <Text style={styles.subtitulo}>Citas Médicas:</Text>
        {citas.map((c, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.nombreVacuna}>📅 {c.fecha}</Text>
            <Text style={styles.descripcion}>🕒 {c.hora}</Text>
            <Text style={styles.descripcion}>📍 {c.lugar}</Text>
            {c.notas && <Text style={styles.notas}>📝 {c.notas}</Text>}
          </View>
        ))}
      </ScrollView>

      <AgregarVacuna
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onGuardar={handleAgregarVacuna}
        fechaPredeterminada={fechaSeleccionada}
      />

      <AgregarCita
        visible={modalCitaVisible}
        onClose={() => setModalCitaVisible(false)}
        fechaSeleccionada={fechaSeleccionada}
        onGuardar={handleAgregarCita}
      />

      <VisualizarFotoCartilla
        visible={modalFoto.visible}
        imagen={modalFoto.imagen}
        onClose={() => setModalFoto({ visible: false, imagen: null })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FDF6EC' },
  returnButton: {
    position: 'absolute',
    top: normalize(40),
    left: normalize(20),
    zIndex: 10,
  },
  returnIcon: {
    width: normalize(40),
    height: normalize(40),
    resizeMode: 'contain',
  },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 , marginTop:80},
  calendarioContainer: { marginVertical: 10 },
  btnAgregar: {
    backgroundColor: '#AED581',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  txtBtn: { color: 'white', fontWeight: 'bold' },
  subtitulo: { fontWeight: 'bold', fontSize: 16, marginVertical: 10 },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  nombreVacuna: { fontSize: 16, fontWeight: 'bold' },
  descripcion: { fontSize: 14, marginTop: 5 },
  fecha: { fontSize: 12, marginTop: 5, color: '#555' },
  notas: { fontSize: 12, marginTop: 5, fontStyle: 'italic' },
  verFoto: {
    color: '#1E88E5',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});

export default CitasCartilla;
