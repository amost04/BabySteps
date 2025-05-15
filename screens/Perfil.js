// 🔧 YA TODO FUNCIONAL 🔧

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image,
  TextInput, Alert, useWindowDimensions, Dimensions, PixelRatio, ScrollView, Modal
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref as dbRef, update, remove } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import { leerCuenta } from '../FB/db_api';
import RegistroBiome from './registroBiome';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

const coloresTitulo = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'];

export default function Perfil({ setPantalla }) {
  const { width: wW, height: wH } = useWindowDimensions();
  const [cuenta, setCuenta] = useState({});
  const [editando, setEditando] = useState(false);
  const [datosEditados, setDatosEditados] = useState({});
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRegistroVisible, setModalRegistroVisible] = useState(false);


  useEffect(() => {
    const cargar = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      const datos = await leerCuenta(user.uid);
      if (datos) {
        setCuenta(datos);
        setDatosEditados(datos);
        if (datos.fotoPerfilUrl) setImagenPerfil(datos.fotoPerfilUrl);
      }
    };
    cargar();
  }, []);

  const subirFotoAFirebase = async (uri) => {
    const user = getAuth().currentUser;
    if (!user) return;
    const db = getDatabase();
    const ref = dbRef(db, `usuarios/${user.uid}`);
    await update(ref, { fotoPerfilUrl: uri });
    setImagenPerfil(uri);
    setCuenta(prev => ({ ...prev, fotoPerfilUrl: uri }));
    setDatosEditados(prev => ({ ...prev, fotoPerfilUrl: uri }));
    Alert.alert('✅ Foto guardada en Firebase');
  };

  const eliminarFoto = async () => {
    const user = getAuth().currentUser;
    if (!user || !imagenPerfil) return;
    const db = getDatabase();
    const campoRef = dbRef(db, `usuarios/${user.uid}/fotoPerfilUrl`);
    await remove(campoRef);
    setImagenPerfil(null);
    setCuenta(prev => ({ ...prev, fotoPerfilUrl: null }));
    setDatosEditados(prev => ({ ...prev, fotoPerfilUrl: null }));
    Alert.alert('✅ Foto eliminada');
  };

  const seleccionarImagen = async () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción:',
      [
        {
          text: 'Ver',
          onPress: () => setModalVisible(true),
        },
        {
          text: 'Galería',
          onPress: async () => {
            const resultado = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!resultado.canceled) await subirFotoAFirebase(resultado.assets[0].uri);
          }
        },
        {
          text: 'Cámara',
          onPress: async () => {
            const resultado = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!resultado.canceled) await subirFotoAFirebase(resultado.assets[0].uri);
          }
        },
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: eliminarFoto,
          style: 'destructive'
        }
      ]
    );
  };

  const handleChange = (campo, valor) => {
    setDatosEditados(prev => ({ ...prev, [campo]: valor }));
  };

  const handleEditar = async () => {
    const user = getAuth().currentUser;
    if (!user) return;
    const db = getDatabase();
    const ref = dbRef(db, `usuarios/${user.uid}`);
    await update(ref, datosEditados);

    const nuevosDatos = await leerCuenta(user.uid);
    setCuenta(nuevosDatos);
    setDatosEditados(nuevosDatos);
    setEditando(false);
    Alert.alert('✅ Datos actualizados');
  };

  const eliminarCampo = async (campo) => {
    const user = getAuth().currentUser;
    if (!user) return;
    const db = getDatabase();
    const campoRef = dbRef(db, `usuarios/${user.uid}/${campo}`);
    await remove(campoRef);
    const nuevosDatos = await leerCuenta(user.uid);
    setCuenta(nuevosDatos);
    setDatosEditados(nuevosDatos);
  };

  return (
    <ImageBackground source={require('../assets/bw.png')} style={[styles.background, { width: wW, height: wH }]}>
      <TouchableOpacity onPress={() => setPantalla('Home')} style={styles.returnButton}>
        <Image source={require('../assets/return.png')} style={styles.returnIcon} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.overlay}>
        <TouchableOpacity onPress={seleccionarImagen}>
          <Image source={imagenPerfil ? { uri: imagenPerfil } : require('../assets/perfil.png')} style={styles.profileImage} />
          <Text style={styles.cambiarFoto}>Cambiar Foto</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)}>
            <Image source={{ uri: imagenPerfil }} style={styles.modalImage} resizeMode="contain" />
          </TouchableOpacity>
        </Modal>

        <View style={styles.titleRow}>
          {'Perfil del Usuario'.split('').map((letra, i) => (
            <Text key={i} style={[styles.title, { color: coloresTitulo[i % coloresTitulo.length] }]}>{letra}</Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>👶 Nombre del Bebé:</Text>
          {editando ? (
            <TextInput style={styles.input} value={datosEditados.nombreBebe || ''} onChangeText={text => handleChange('nombreBebe', text)} />
          ) : (
            <Text style={styles.text}>{cuenta.nombreBebe || 'No disponible'}</Text>
          )}

          <Text style={styles.label}>🎂 Fecha de nacimiento:</Text>
          {editando ? (
            <TextInput style={styles.input} value={datosEditados.fechaNacimiento || ''} onChangeText={text => handleChange('fechaNacimiento', text)} />
          ) : (
            <Text style={styles.text}>{cuenta.fechaNacimiento || 'No disponible'}</Text>
          )}

          <Text style={styles.label}>👨‍👩‍👧 Padre/Madre 1:</Text>
          {editando ? (
            <TextInput style={styles.input} value={datosEditados.nombrePadreMadre || ''} onChangeText={text => handleChange('nombrePadreMadre', text)} />
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
            <TextInput style={styles.input} value={datosEditados.nombrePadreMadre2 || ''} onChangeText={text => handleChange('nombrePadreMadre2', text)} />
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

        <TouchableOpacity style={styles.button} onPress={editando ? handleEditar : () => setEditando(true)}>
          <Text style={styles.buttonText}>{editando ? 'Confirmar Cambios' : 'Editar Datos'}</Text>
        </TouchableOpacity>

       <TouchableOpacity style={[styles.button, { backgroundColor: '#10b981' }]} onPress={() => setModalRegistroVisible(true)}>
        <Text style={styles.buttonText}>📈 Registro Biométrico Semanal</Text>
       </TouchableOpacity>
       <RegistroBiome visible={modalRegistroVisible} onClose={() => setModalRegistroVisible(false)} />

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
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: normalize(20),
  },
  title: {
    fontSize: normalize(34),
    fontWeight: 'bold',
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
    marginBottom: normalize(20),
  },
  buttonText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: 'bold',
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
  profileImage: {
    width: normalize(175),
    height: normalize(175),
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: normalize(10)
  },
  cambiarFoto: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: normalize(15),
    textAlign: 'center',
    marginBottom: normalize(10)
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalImage: {
    width: '90%',
    height: '70%',
    borderRadius: 20,
  }
});
