import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image,
  useWindowDimensions, Dimensions, PixelRatio, TextInput, ScrollView, Modal
} from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';

function formatearCategoria(nombre) {
  return nombre
    .replace(/_/g, ' ') // Reemplaza guiones bajos por espacios
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitaliza cada palabra
}

const coloresTitulo = [
  '#FF6B6B', '#FBC531', '#4CD137', '#00A8FF', '#9C88FF',
  '#E84118', '#44BD32', '#00A8FF', '#F368E0', '#FD7272',
  '#1ABC9C', '#FDA7DF', '#A3CB38', '#00D2D3', '#ED4C67',
  '#F8EFBA', '#C44569', '#3B3B98', '#BDC581'
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

const categoriaImagenes = {
  salud: require('../assets/faq/salud.png'),
  alimentacion: require('../assets/faq/alimentacion.png'),
  emociones: require('../assets/faq/emociones.png'),
  sueño: require('../assets/faq/sueno.png'),
  vacunas: require('../assets/faq/vacunas.png'),
  higiene: require('../assets/faq/higiene.png'),
  desarrollo: require('../assets/faq/desarrollo.png'),
  seguridad: require('../assets/faq/seguridad.png'),
  juegos: require('../assets/faq/juegos.png'),
  lactancia: require('../assets/faq/lactancia.png'),
  estimulación_temprana: require('../assets/faq/estimulacion.png'),
  citas_medicas: require('../assets/faq/citas.png'),
  estimulación_sensorial: require('../assets/faq/sensorial.png'),
  sueño_seguro: require('../assets/faq/suenoss.png'),
  dentición: require('../assets/faq/dentincion.png')
};

export default function FAQ({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();
  const [faqData, setFaqData] = useState({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('salud');
  const [busqueda, setBusqueda] = useState('');
  const [respuestaVisible, setRespuestaVisible] = useState(null);

  useEffect(() => {
    const fetchFaq = async () => {
      const db = getDatabase();
      const snapshot = await get(ref(db, 'faq/faq'));
      if (snapshot.exists()) {
        setFaqData(snapshot.val());
      }
    };
    fetchFaq();
  }, []);

  const categorias = Object.keys(faqData);
  const preguntas = faqData[categoriaSeleccionada] || {};
  const preguntasFiltradas = Object.values(preguntas).filter(item =>
    item.pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.respuesta.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <ImageBackground
      source={require('../assets/bw.png')}
      style={[styles.background, { width: wW, height: wH }]}
      resizeMode="cover"
    >
      <TouchableOpacity onPress={() => setPantalla('Home')} style={styles.returnButton}>
        <Image source={require('../assets/return.png')} style={styles.returnIcon} />
      </TouchableOpacity>

      <View style={styles.overlay}>
      <View style={{ alignItems: 'center', marginTop: normalize(20), marginBottom: normalize(10) }}>
         <View style={{ flexDirection: 'row' }}>{'Preguntas'.split('').map((letra, i) => (
          <Text key={`p${i}`}style={{fontSize: normalize(36),fontWeight: 'bold',color: coloresTitulo[i % coloresTitulo.length], }}>{letra}</Text> ))}
         </View>
         <View style={{ flexDirection: 'row' }}>{'Frecuentes'.split('').map((letra, i) => (<Text key={`f${i}`}style={{fontSize: normalize(36),fontWeight: 'bold',color: coloresTitulo[i % coloresTitulo.length],}}>{letra}</Text> ))}
         </View>
      </View>

        <View style={styles.categorias}>
           <ScrollView horizontal style={styles.categorias} showsHorizontalScrollIndicator={false}>
             {categorias.map(cat => (
               <TouchableOpacity
                 key={cat}
                 style={[styles.categoriaBtn, categoriaSeleccionada === cat && styles.categoriaActiva]}
                 onPress={() => setCategoriaSeleccionada(cat)}
               >
                 <Image source={categoriaImagenes[cat]} style={styles.icono} />
                 <Text style={styles.categoriaText}>{formatearCategoria(cat)}</Text>
               </TouchableOpacity>
             ))}
          </ScrollView>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Buscar pregunta..."
          placeholderTextColor="#aaa"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        

        
        <ScrollView style={styles.scroll}>
          {preguntasFiltradas.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.card}
              onPress={() => setRespuestaVisible(item)}
            >
              <Text style={styles.pregunta}>❓ {item.pregunta}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Modal visible={!!respuestaVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalPregunta}>❓ {respuestaVisible?.pregunta}</Text>
            <Text style={styles.modalRespuesta}>✅ {respuestaVisible?.respuesta}</Text>
            <TouchableOpacity onPress={() => setRespuestaVisible(null)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    paddingHorizontal: normalize(20),
    paddingTop: normalize(60),
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  title: {
    fontSize: normalize(26),
    color: 'white',
    fontWeight: 'bold',
    marginBottom: normalize(10),
    marginTop: normalize(20),
    textAlign: 'center',
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
  categorias: {
    flexDirection: 'row',
    marginBottom: normalize(10),
    marginTop: normalize(5),
  },
  categoriaBtn: {
    backgroundColor: '#ccc',
    borderRadius: normalize(15),
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(10),
    marginRight: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
    height: normalize(110),
    minWidth: normalize(120),
  },
  categoriaActiva: {
    backgroundColor: '#6499fa',
  },
  categoriaText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: normalize(20),
    fontFamily: 'Montserrat_500Medium_Italic',
    textTransform: 'capitalize',
    textAlign: 'center',
    height: normalize(50),
  },
  icono: {
    width: normalize(80),
    height: normalize(80),
    marginTop: normalize(15),
    resizeMode: 'contain',
  },
  input: {
    height: normalize(42),
    backgroundColor: 'white',
    borderRadius: normalize(10),
    paddingHorizontal: normalize(15),
    fontSize: normalize(14),
    fontFamily: 'Montserrat_500Medium_Italic',
    marginTop: normalize(10),
    marginBottom: normalize(10),
  },
  scroll: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffffcc',
    padding: normalize(12),
    borderRadius: normalize(12),
    marginBottom: normalize(10),
  },
  pregunta: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Montserrat_500Medium_Italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: normalize(20),
    width: '90%',
    maxWidth: 400,
  },
  modalPregunta: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginBottom: normalize(10),
    color: '#000',
    fontFamily: 'Montserrat_500Medium_Italic',
  },
  modalRespuesta: {
    fontSize: normalize(16),
    color: '#333',
    marginBottom: normalize(15),
    fontFamily: 'Montserrat_500Medium_Italic',
  },
  closeBtn: {
    backgroundColor: '#6499fa',
    padding: normalize(10),
    borderRadius: 10,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: 'bold',
    fontFamily: 'Montserrat_500Medium_Italic',
  },
});
