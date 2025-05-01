// BuscadorAlimentosModal.js
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable
} from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
const capitalizar = (str) =>
    str
      .toLowerCase()
      .replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());
  
const BuscadorAlimentosModal = ({ visible, onClose }) => {
  const [busqueda, setBusqueda] = useState('');
  const [alimentos, setAlimentos] = useState({});
  const [filtrados, setFiltrados] = useState({});
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    if (visible) {
      const db = getDatabase();
      const alimentosRef = ref(db, 'nutricion/alimentos');
      get(alimentosRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setAlimentos(data);
            setFiltrados(data);
          }
        })
        .catch(error => {
          console.error('Error al leer alimentos:', error);
        });
    }
  }, [visible]);

  useEffect(() => {
    const resultados = {};
    Object.keys(alimentos).forEach(nombre => {
      if (nombre.toLowerCase().includes(busqueda.toLowerCase())) {
        resultados[nombre] = alimentos[nombre];
      }
    });
    setFiltrados(resultados);
  }, [busqueda, alimentos]);

  const renderAlimento = (nombre, datos) => (
    <TouchableOpacity
      key={nombre}
      style={{
        backgroundColor: '#db79f3',
        borderRadius: 12,
        padding: 13,
        marginBottom: 8,
      }}
      onPress={() => setSeleccionado({ nombre, ...datos })}
    >
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{capitalizar(nombre)}</Text>
    </TouchableOpacity>
  );

  const renderInfoSeleccionada = () => (
    <View style={{ marginTop: 16, backgroundColor: '#fdb45d', padding: 16, borderRadius: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        {capitalizar(seleccionado.nombre)}
      </Text>
      <Text style={{ fontSize: 20, marginTop: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>📅 Edad recomendada:</Text> {seleccionado.edad}</Text>
      <Text style={{ fontSize: 20,marginTop: 4 }}>
        <Text style={{ fontSize: 22,fontWeight: 'bold' }}>💪Beneficios:</Text> {seleccionado.beneficios}
      </Text>
      <Text style={{ fontSize: 20,marginTop: 4 }}>
        <Text style={{ fontSize: 22,fontWeight: 'bold' }}>⚠️Advertencias:</Text> {seleccionado.advertencias}
      </Text>
      <TouchableOpacity
        onPress={() => setSeleccionado(null)}
        style={{
          marginTop: 12,
          backgroundColor: '#f4770f',
          padding: 8,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>🔙 Volver</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 22 }}>
        <View style={{ backgroundColor: '#fafafa', borderRadius: 26, padding: 22, flex: 1 }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
          🔎Buscador de Alimentos
          </Text>
          <TextInput
            placeholder="Buscar alimento..."
            value={busqueda}
            onChangeText={setBusqueda}
            style={{
              backgroundColor: '#fff',
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: '#ccc',
            }}
          />
          <ScrollView>
            {seleccionado ? (
              renderInfoSeleccionada()
            ) : Object.keys(filtrados).length > 0 ? (
              Object.entries(filtrados).map(([nombre, datos]) =>
                renderAlimento(nombre, datos)
              )
            ) : (
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No se encontraron alimentos.</Text>
            )}
          </ScrollView>
          <Pressable
            onPress={onClose}
            style={{
              marginTop: 12,
              backgroundColor: '#e57373',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>❌ Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default BuscadorAlimentosModal;
