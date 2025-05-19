import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, push, remove, update } from 'firebase/database';

export default function NotasChecklist() {
  const [nota, setNota] = useState('');
  const [notas, setNotas] = useState([]);

  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;

  const notasRef = ref(db, `usuarios/${user.uid}/notas`);

  useEffect(() => {
    onValue(notasRef, (snapshot) => {
      const data = snapshot.val() || {};
      const lista = Object.keys(data).map((key) => ({
        id: key,
        texto: data[key].texto,
        completado: data[key].completado || false,
      }));
      setNotas(lista);
    });
  }, []);

  const agregarNota = () => {
    if (nota.trim()) {
      push(notasRef, { texto: nota, completado: false });
      setNota('');
    }
  };

  const eliminarNota = (id) => {
    remove(ref(db, `usuarios/${user.uid}/notas/${id}`));
  };

  const alternarEstado = (id, estadoActual) => {
    update(ref(db, `usuarios/${user.uid}/notas/${id}`), {
      completado: !estadoActual,
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.nota}>
            <TouchableOpacity onPress={() => alternarEstado(item.id, item.completado)}>
              <Text style={styles.texto}>
                {item.completado ? '✅' : '⬜'} {item.texto}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => eliminarNota(item.id)}>
              <Text style={styles.basura}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TextInput
        placeholder="Nueva nota..."
        style={styles.input}
        value={nota}
        onChangeText={setNota}
      />
      <TouchableOpacity style={styles.boton} onPress={agregarNota}>
        <Text style={styles.botonTexto}>Agregar ✅</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(247, 165, 13, 0.84)',
    borderRadius: 12,
    padding: 12,
    width: 300,
    height: 280,
    marginTop: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  nota: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  texto: {
    fontSize: 18,
  },
  basura: {
    fontSize: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  boton: {
    backgroundColor: '#4ade80',
    padding: 6,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  botonTexto: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#black',
  },
});
