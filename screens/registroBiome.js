// registroBiome.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref as dbRef, onValue, push, update, remove } from 'firebase/database';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function RegistroBiome({ visible, onClose }) {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [datos, setDatos] = useState([]);
  const [modalFormVisible, setModalFormVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [registroActualId, setRegistroActualId] = useState(null);

  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const ref = dbRef(db, `usuarios/${user.uid}/biometricoHistorial`);

    onValue(ref, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const array = Object.entries(val).map(([key, value]) => ({ id: key, ...value }));
        setDatos(array);
      } else {
        setDatos([]);
      }
    });
  }, [user]);

  const guardarRegistro = async () => {
    if (!peso || !altura || !temperatura) return alert('Completa todos los campos');
    const db = getDatabase();

    if (modoEdicion && registroActualId) {
      const ref = dbRef(db, `usuarios/${user.uid}/biometricoHistorial/${registroActualId}`);
      await update(ref, {
        peso: parseFloat(peso),
        altura: parseFloat(altura),
        temperatura: parseFloat(temperatura)
      });
      alert('✏️ Registro actualizado');
    } else {
      const ref = dbRef(db, `usuarios/${user.uid}/biometricoHistorial`);
      const hoy = new Date();
      const fecha = hoy.toLocaleDateString('es-MX');

      await push(ref, {
        peso: parseFloat(peso),
        altura: parseFloat(altura),
        temperatura: parseFloat(temperatura),
        fecha
      });
      alert('✅ Registro guardado');
    }

    setPeso('');
    setAltura('');
    setTemperatura('');
    setModalFormVisible(false);
    setModoEdicion(false);
    setRegistroActualId(null);
  };

  const eliminarRegistro = async (id) => {
    const db = getDatabase();
    const ref = dbRef(db, `usuarios/${user.uid}/biometricoHistorial/${id}`);
    await remove(ref);
    alert('🗑️ Registro eliminado');
  };

  const editarRegistro = (id) => {
    const registro = datos.find(d => d.id === id);
    if (!registro) return;

    setPeso(registro.peso.toString());
    setAltura(registro.altura.toString());
    setTemperatura(registro.temperatura.toString());
    setRegistroActualId(id);
    setModoEdicion(true);
    setModalFormVisible(true);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.superior}>
          <Text style={styles.titulo}>📈 Registro Biométrico Semanal</Text>

          <TouchableOpacity style={styles.boton} onPress={() => setModalFormVisible(true)}>
            <Text style={styles.textoBoton}>Añadir Registro</Text>
          </TouchableOpacity>

          <Text style={styles.subtitulo}>📊 Evolución Semanal</Text>
          {datos.length > 0 && (
            <LineChart
              data={{
                labels: datos.map(d => d.fecha),
                datasets: [
                  { data: datos.map(d => d.peso), color: () => '#60A5FA', strokeWidth: 2 },
                  { data: datos.map(d => d.altura), color: () => '#34D399', strokeWidth: 2 },
                  { data: datos.map(d => d.temperatura), color: () => '#FBBF24', strokeWidth: 2 },
                ],
                legend: ['Peso', 'Altura', 'Temperatura']
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#f0f0f0',
                backgroundGradientTo: '#fff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              style={{ borderRadius: 10, marginBottom: 10 }}
            />
          )}
        </View>

        <View style={styles.inferior}>
          <Text style={styles.subtitulo}>📄 Registros</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            {datos.map((d, i) => (
              <View key={i} style={[styles.card, { backgroundColor: i % 2 === 0 ? '#eea2f3' : '#FEF9C3' }]}>
                <Text style={styles.cardText}>📅 {d.fecha}</Text>
                <Text style={styles.cardText}>📦 Peso: {d.peso} kg</Text>
                <Text style={styles.cardText}>📏 Altura: {d.altura} cm</Text>
                <Text style={styles.cardText}>🌡️ Temperatura: {d.temperatura} °C</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <TouchableOpacity onPress={() => editarRegistro(d.id)} style={{ padding: 4 }}>
                    <Text style={{ fontSize:18, color: '#0284C7' }}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => eliminarRegistro(d.id)} style={{ padding: 4 }}>
                    <Text style={{ fontSize:18, color: 'red' }}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.boton, { backgroundColor: '#ef4444', position: 'absolute', bottom: 10, alignSelf: 'center' }]} onPress={onClose}>
            <Text style={styles.textoBoton}>Cerrar</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalFormVisible} animationType="slide" transparent>
          <View style={styles.modalFormFondo}>
            <View style={styles.modalFormContenido}>
              <Text style={styles.titulo}>{modoEdicion ? '✏️ Editar Registro' : '📝 Nuevo Registro'}</Text>
              <Text style={{ fontSize: 16, color: '#484b47', marginBottom: 5 }}>
                Ingresa el peso, altura y temperatura del bebé para la semana actual:
              </Text>
              <TextInput placeholder="Peso (kg)" placeholderTextColor="#888" keyboardType="numeric" style={styles.input} value={peso} onChangeText={setPeso} />
              <TextInput placeholder="Altura (cm)" placeholderTextColor="#888" keyboardType="numeric" style={styles.input} value={altura} onChangeText={setAltura} />
              <TextInput placeholder="Temperatura (°C)" placeholderTextColor="#888"  keyboardType="numeric" style={styles.input} value={temperatura} onChangeText={setTemperatura} />
              <TouchableOpacity style={styles.boton} onPress={guardarRegistro}>
                <Text style={styles.textoBoton}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setModalFormVisible(false); setModoEdicion(false); }} style={[styles.boton, { backgroundColor: '#ccc', marginTop: 10 }]}>
                <Text style={[styles.textoBoton, { color: '#000' }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e1fcfe',
    paddingTop: 50,
  },
  superior: {
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  inferior: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
    alignSelf: 'center',
  },
  subtitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 8
  },
  boton: {
    backgroundColor: '#ea8322',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center'
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  card: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
  },
  cardText: {
    fontSize: 16,  // o prueba con 18 o 20 si quieres más grande
    color: '#000',
    marginBottom: 5,
  },
  modalFormFondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalFormContenido: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20
  }
});