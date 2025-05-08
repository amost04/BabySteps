// RegistroAlergias.js
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const capitalizar = (texto) =>
  texto
    .toLowerCase()
    .split(' ')
    .map(palabra =>
      palabra.charAt(0).toLocaleUpperCase('es-MX') + palabra.slice(1)
    )
    .join(' ');

const RegistroAlergias = ({ visible, onClose }) => {
  const [alimentos, setAlimentos] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [manual, setManual] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [modalAuxilioVisible, setModalAuxilioVisible] = useState(false);
  const [verSoloAlergias, setVerSoloAlergias] = useState(false);
  const uid = getAuth().currentUser?.uid;

  useEffect(() => {
    if (visible) {
      const db = getDatabase();
      get(ref(db, 'nutricion/alimentos')).then(snapshot => {
        if (snapshot.exists()) {
          const datos = Object.keys(snapshot.val());
          setAlimentos(datos);
        }
      });

      get(ref(db, 'nutricion/alergias')).then(snapshot => {
        if (snapshot.exists()) {
          setManual(snapshot.val());
        }
      });

      get(ref(db, `usuarios/${uid}/alergias`)).then(snapshot => {
        if (snapshot.exists()) {
          setRespuestas(snapshot.val());
        }
      });
    }
  }, [visible]);

  const guardarRespuesta = (alimento, tipo, nota) => {
    if (!uid) return;
    const db = getDatabase();
    set(ref(db, `usuarios/${uid}/alergias/${alimento}`), {
      reaccion: tipo,
      nota: nota || '',
    });
    setRespuestas(prev => ({
      ...prev,
      [alimento]: { ...prev[alimento], reaccion: tipo, nota: nota || '' },
    }));
  };

  const renderAlimento = (nombre) => {
    const respuesta = respuestas[nombre] || {};
    const notaActual = respuesta.nota || '';
    const reaccion = respuesta.reaccion || '';
    return (
      <View key={nombre} style={styles.alimentoBox}>
        <Text style={styles.alimentoNombre}>{capitalizar(nombre)}</Text>
        <View style={styles.botonesRow}>
          <TouchableOpacity
            style={[styles.boton, {
              backgroundColor: reaccion === 'no' ? '#65a30d' : '#a3e635',
            }]}
            onPress={() => guardarRespuesta(nombre, 'no', notaActual)}
          >
            <Text style={styles.botonTexto}>✅</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.boton, {
              backgroundColor: reaccion === 'si' ? '#dc2626' : '#f87171',
            }]}
            onPress={() => guardarRespuesta(nombre, 'si', notaActual)}
          >
            <Text style={styles.botonTexto}>❌</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.inputNota}
          placeholder="Notas opcionales..."
          value={notaActual}
          onChangeText={(text) => setRespuestas(prev => ({
            ...prev,
            [nombre]: { ...prev[nombre], nota: text },
          }))}
          onBlur={() => guardarRespuesta(nombre, reaccion || '', notaActual)}
        />
      </View>
    );
  };

  const alimentosFiltrados = alimentos.filter(a => {
    const coincideBusqueda = a.toLowerCase().includes(busqueda.toLowerCase());
    const esAlergia = respuestas[a]?.reaccion === 'si';
    return coincideBusqueda && (!verSoloAlergias || esAlergia);
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <Text style={styles.titulo}>🚨 Registro de Alergias</Text>
          <Text style={styles.descripcion}>Marca si algún alimento causó reacción alérgica:</Text>
          <Text style={styles.descripcion}>✅ No causó alergia | ❌ Causó alergia</Text>

          <TextInput
            placeholder="Buscar alimento..."
            value={busqueda}
            onChangeText={setBusqueda}
            style={styles.buscador}
          />

          <TouchableOpacity activeOpacity={1}
            style={[styles.botonAuxilio, { backgroundColor: verSoloAlergias ? '#10b981' : '#9ca3af' }]}
            onPress={() => setVerSoloAlergias(!verSoloAlergias)}
          >
            <Text style={{ color: 'black', fontWeight: 'bold' }}>{verSoloAlergias ? '🔍 Ver Todos' : '📋 Mis Alergias'}</Text>
          </TouchableOpacity>

          <ScrollView style={{ flex: 1 }}>
            {alimentosFiltrados.map(nombre => renderAlimento(nombre))}
          </ScrollView>

          <TouchableOpacity
            style={styles.botonAuxilio}
            onPress={() => setModalAuxilioVisible(true)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>🆘 Auxilio</Text>
          </TouchableOpacity>

          <Pressable style={styles.botonCerrar} onPress={onClose}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Cerrar</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={modalAuxilioVisible} animationType="slide">
        <View style={styles.fondoAuxilio}>
          <ScrollView contentContainerStyle={styles.manualContainer}>
            <Text style={styles.manualTitulo}>🆘 {manual?.titulo}</Text>
            <Text style={styles.manualIntro}>{manual?.introduccion}</Text>
            {manual?.secciones && Object.values(manual.secciones).map((seccion, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{seccion.titulo}</Text>
                {seccion.contenido && Object.values(seccion.contenido).map((linea, j) => (
                  <Text key={j} style={{ fontSize: 15, marginLeft: 10 }}>• {linea}</Text>
                ))}
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.botonCerrar} onPress={() => setModalAuxilioVisible(false)}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Cerrar</Text>
          </Pressable>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(251, 172, 13, 0.89)',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  contenedor: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flex: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  descripcion: {
    textAlign: 'center',
    marginBottom: 5,
  },
  buscador: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  alimentoBox: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  alimentoNombre: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  botonesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  boton: {
    padding: 8,
    borderRadius: 10,
    width: 50,
    alignItems: 'center',
  },
  botonTexto: {
    fontSize: 18,
  },
  inputNota: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 6,
    marginTop: 4,
  },
  botonAuxilio: {
    marginTop: 8,
    backgroundColor: '#f43f5e',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonCerrar: {
    marginTop: 10,
    backgroundColor: '#4b5563',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  fondoAuxilio: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  manualContainer: {
    paddingBottom: 40,
  },
  manualTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  manualIntro: {
    fontSize: 16,
    marginBottom: 10,
  },
  manualPaso: {
    fontSize: 15,
    marginBottom: 6,
  },
});

export default RegistroAlergias;