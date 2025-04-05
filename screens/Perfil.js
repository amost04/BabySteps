import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image,
  TextInput, Alert, useWindowDimensions, Dimensions, PixelRatio, ScrollView
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { leerCuenta, updateCuenta, removeCampo } from '../FB/db_api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function Perfil({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();
  const [cuenta, setCuenta] = useState({});
  const [editando, setEditando] = useState(false);
  const [datosEditados, setDatosEditados] = useState({});

  useEffect(() => {
    const cargar = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      const datos = await leerCuenta(user.uid);
      if (datos) {
        setCuenta(datos);
        setDatosEditados(datos);
      }
    };
    cargar();
  }, []);

  const handleChange = (campo, valor) => {
    setDatosEditados(prev => ({ ...prev, [campo]: valor }));
  };

  const handleEditar = async () => {
    const user = getAuth().currentUser;
    if (!user) return;

    if (editando) {
      await updateCuenta(user.uid, datosEditados);
      setCuenta(datosEditados);
      Alert.alert('✅ Datos actualizados');
    }

    setEditando(!editando);
  };

  const eliminarCampo = async (campo) => {
    const user = getAuth().currentUser;
    if (!user) return;
    await removeCampo(user.uid, campo);
    const copia = { ...cuenta };
    delete copia[campo];
    setCuenta(copia);
    setDatosEditados(copia);
  };

  return (
    <ImageBackground
      source={require('../assets/bw.png')}
      style={[styles.background, { width: wW, height: wH }]}
    >
      <TouchableOpacity onPress={() => setPantalla('Home')} style={styles.returnButton}>
        <Image source={require('../assets/return.png')} style={styles.returnIcon} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.overlay}>
        <Text style={styles.title}>Perfil del Usuario</Text>

        <View style={styles.card}>
          <Text style={styles.label}>👶 Nombre del Bebé:</Text>
          {editando ? (
            <TextInput
              style={styles.input}
              value={datosEditados.nombreBebe || ''}
              onChangeText={(text) => handleChange('nombreBebe', text)}
            />
          ) : (
            <Text style={styles.text}>{cuenta.nombreBebe || 'No disponible'}</Text>
          )}

          <Text style={styles.label}>🎂 Fecha de nacimiento:</Text>
          {editando ? (
            <TextInput
              style={styles.input}
              value={datosEditados.fechaNacimiento || ''}
              onChangeText={(text) => handleChange('fechaNacimiento', text)}
            />
          ) : (
            <Text style={styles.text}>{cuenta.fechaNacimiento || 'No disponible'}</Text>
          )}

          <Text style={styles.label}>👨‍👩‍👧 Padre/Madre 1:</Text>
          {editando ? (
            <TextInput
              style={styles.input}
              value={datosEditados.nombrePadreMadre || ''}
              onChangeText={(text) => handleChange('nombrePadreMadre', text)}
            />
          ) : (
            <Text style={styles.text}>{cuenta.nombrePadreMadre || 'No disponible'}</Text>
          )}
          {cuenta.nombrePadreMadre && (
            <TouchableOpacity onPress={() => eliminarCampo('nombrePadreMadre')}>
              <Text style={styles.remove}>🗑️ Eliminar Padre/Madre 1</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.label}>👨‍👩‍👧 Padre/Madre 2:</Text>
          {editando ? (
            <TextInput
              style={styles.input}
              value={datosEditados.nombrePadreMadre2 || ''}
              onChangeText={(text) => handleChange('nombrePadreMadre2', text)}
            />
          ) : (
            <Text style={styles.text}>{cuenta.nombrePadreMadre2 || 'No disponible'}</Text>
          )}
          {cuenta.nombrePadreMadre2 && (
            <TouchableOpacity onPress={() => eliminarCampo('nombrePadreMadre2')}>
              <Text style={styles.remove}>🗑️ Eliminar Padre/Madre 2</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.label}>📧 Correo:</Text>
          <Text style={styles.text}>{cuenta.correo || 'No disponible'}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleEditar}>
          <Text style={styles.buttonText}>{editando ? 'Confirmar Cambios' : 'Editar Datos'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingTop: normalize(60),
  },
  title: {
    fontSize: normalize(28),
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: normalize(20),
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: normalize(15),
    marginBottom: normalize(20),
  },
  label: {
    fontSize: normalize(16),
    color: '#444',
    fontWeight: 'bold',
    marginTop: normalize(10),
  },
  text: {
    fontSize: normalize(16),
    color: '#000',
  },
  remove: {
    color: 'red',
    marginTop: normalize(5),
    fontSize: normalize(14),
  },
  input: {
    width: '100%',
    height: normalize(50),
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: normalize(15),
    fontSize: normalize(16),
    marginBottom: normalize(10),
    borderWidth: 1,
    borderColor: '#ccc'
  },
  button: {
    backgroundColor: '#6499fa',
    padding: normalize(12),
    borderRadius: 10,
    marginBottom: normalize(40),
  },
  buttonText: {
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: 'bold',
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
});
