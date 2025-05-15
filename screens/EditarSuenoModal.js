import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, update } from 'firebase/database';

export default function EditarSuenoModal({ visible, onClose, registro, recargar }) {
  const [horaDormir, setHoraDormir] = useState('');
  const [horaDespertar, setHoraDespertar] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    setHoraDormir(registro?.horaDormir || '');
    setHoraDespertar(registro?.horaDespertar || '');
    setNotas(registro?.notas || '');
  }, [registro]);

  const calcularDuracion = (inicio, fin) => {
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);

    const d1 = new Date(0, 0, 0, h1, m1);
    const d2 = new Date(0, 0, 0, h2, m2);
    if (d2 < d1) d2.setDate(d2.getDate() + 1); // si se despierta al día siguiente

    const diff = (d2 - d1) / 60000; // minutos
    const horas = Math.floor(diff / 60);
    const minutos = Math.round(diff % 60);
    return `${horas}h ${minutos}m`;
  };

  const guardarCambios = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const duracion = calcularDuracion(horaDormir, horaDespertar);

    const db = getDatabase();
    const path = `usuarios/${user.uid}/sueno/${registro.fecha}/${registro.id}`;
    await update(ref(db, path), {
      horaDormir,
      horaDespertar,
      notas,
      duracion
    });

    recargar();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Editar Registro</Text>

          <Text style={styles.label}>Hora de dormir</Text>
          <TextInput style={styles.input} value={horaDormir} onChangeText={setHoraDormir} />

          <Text style={styles.label}>Hora de despertar</Text>
          <TextInput style={styles.input} value={horaDespertar} onChangeText={setHoraDespertar} />

          <Text style={styles.label}>Notas</Text>
          <TextInput
            style={[styles.input, { height: 80 }]} multiline
            value={notas} onChangeText={setNotas}
          />

          <TouchableOpacity style={styles.btnGuardar} onPress={guardarCambios}>
            <Text style={styles.btnTexto}>Guardar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancelar} onPress={onClose}>
            <Text style={styles.btnTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5
  },
  btnGuardar: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  btnCancelar: {
    backgroundColor: '#E57373',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  btnTexto: { color: 'white', textAlign: 'center', fontWeight: 'bold' }
});
