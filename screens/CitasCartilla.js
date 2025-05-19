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
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
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
  const [mostrarVacunas, setMostrarVacunas] = useState(false);
  const [mostrarCitas, setMostrarCitas] = useState(false);
  const [fechasMarcadas, setFechasMarcadas] = useState({});


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

      const refVacunas = ref(db, `usuarios/${user.uid}/vacunas`);
      onValue(refVacunas, (snapshot) => {
        const data = snapshot.val();
        const lista = data ? Object.values(data) : [];
        setVacunas(lista);
      });

      const refCitas = ref(db, `usuarios/${user.uid}/citasMedicas`);
      onValue(refCitas, (snapshot) => {
        const data = snapshot.val();
        const lista = data ? Object.values(data) : [];
        setCitas(lista);

        // ✅ Marcar fechas en el calendario
        const citasMarcadas = {};
        lista.forEach(cita => {
          citasMarcadas[cita.fecha] = {
            marked: true,
            dotColor: 'red',
            selectedColor: '#ff7f7f',
          };
        });
        setFechasMarcadas(citasMarcadas);
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
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...fechasMarcadas,
            [fechaSeleccionada]: {
              ...(fechasMarcadas[fechaSeleccionada] || {}),
              selected: true,
              selectedColor: '#81d4fa',
            },
          }}
        />
      </View>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.btnAgregar}>
        <Text style={styles.txtBtn}>Agregar Vacuna</Text>
      </TouchableOpacity>

      <View style={styles.botonesFila}>
        <TouchableOpacity style={styles.botonToggle} onPress={() => setMostrarVacunas(!mostrarVacunas)}>
          <Image source={require('../assets/faq/vacunas.png')} style={styles.iconoBoton} />
          <Text style={styles.txtBotonToggle}>Vacunas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonToggle} onPress={() => setMostrarCitas(!mostrarCitas)}>
          <Image source={require('../assets/faq/citas.png')} style={styles.iconoBoton} />
          <Text style={styles.txtBotonToggle}>Citas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {mostrarVacunas && (
          <>
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
          </>
        )}

        {mostrarCitas && (
          <>
            <Text style={styles.subtitulo}>Citas Médicas:</Text>
            {citas.map((c, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.nombreVacuna}>📅 {c.fecha}</Text>
                <Text style={styles.descripcion}>🕒 {c.hora}</Text>
                <Text style={styles.descripcion}>📍 {c.lugar}</Text>
                {c.notas && <Text style={styles.notas}>📝 {c.notas}</Text>}
              </View>
            ))}
          </>
        )}
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
  title: { fontSize: 23, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, marginTop: 75 },
  calendarioContainer: { marginVertical: 8 },
  btnAgregar: {
    backgroundColor: '#AED581',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  txtBtn: { color: 'white', fontWeight: 'bold' },
  subtitulo: { fontWeight: 'bold', fontSize: 18, marginVertical: 10 },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  nombreVacuna: { fontSize: 20, fontWeight: 'bold' },
  descripcion: { fontSize: 18, marginTop: 5 },
  fecha: { fontSize: 18, marginTop: 5, color: '#555' },
  notas: { fontSize: 18, marginTop: 5, fontStyle: 'italic' },
  verFoto: {
    color: '#1E88E5',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  botonesFila: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  botonToggle: {
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 10,
    width: '45%',
  },
  iconoBoton: {
    width: 50,
    height: 50,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  txtBotonToggle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CitasCartilla;
