import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';

const imagenes = [
  require('../assets/escala/cara1.png'),
  require('../assets/escala/cara2.png'),
  require('../assets/escala/cara3.png'),
  require('../assets/escala/cara4.png'),
  require('../assets/escala/cara5.png'),
  require('../assets/escala/cara6.png'),
];

const colores = ['#86efac', '#bef264', '#fde047', '#fdba74', '#f87171', '#ef4444'];

export default function EscalaWongBaker() {
  const [seleccionado, setSeleccionado] = useState(null);

  const hoy = new Date().toLocaleDateString('en-CA'); // formato YYYY-MM-DD

  useEffect(() => {
    const cargarSeleccion = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getDatabase();
      const snapshot = await get(ref(db, `usuarios/${user.uid}/escala/${hoy}`));
      if (snapshot.exists()) {
        const valor = snapshot.val().valor;
        setSeleccionado(valor - 1); // -1 para que sea índice del array
      }
    };

    cargarSeleccion();
  }, []);

  const guardarSeleccion = async (indice) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getDatabase();
    await set(ref(db, `usuarios/${user.uid}/escala/${hoy}`), { valor: indice + 1 });
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Escala de Emociones</Text>
      <View style={styles.fila}>
        {imagenes.map((img, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setSeleccionado(index);
              guardarSeleccion(index);
            }}
            style={[
              styles.cara,
              seleccionado === index && { backgroundColor: colores[index] },
            ]}
          >
            <Image source={img} style={styles.img} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: 'rgba(86, 197, 248, 0.8)',
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cara: {
    marginHorizontal: 4,
    borderRadius: 8,
    padding: 5,
  },
  img: {
    width: 40,
    height: 40,
  },
});
