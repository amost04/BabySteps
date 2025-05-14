// VisualizarFotoCartilla.js
import React from 'react';
import {
  Modal,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';

const ModalVisualizarFoto = ({ visible, imagen, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.modalContent}
          maximumZoomScale={5}
          minimumZoomScale={1}
          pinchGestureEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: imagen }}
            style={{
              width: '100%',
              aspectRatio: 3 / 4,
              resizeMode: 'contain',
            }}
          />
        </ScrollView>

        <TouchableOpacity style={styles.btnCerrar} onPress={onClose}>
          <Text style={styles.btnTexto}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scroll: {
    width: '100%',
    flex: 1
  },
  modalContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  imagenExpandida: {
    width: '100%',
    aspectRatio: 3/4,
    resizeMode: 'contain',
    borderRadius: 10
  },
  btnCerrar: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#FF7043',
    padding: 10,
    borderRadius: 6
  },
  btnTexto: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default ModalVisualizarFoto;
