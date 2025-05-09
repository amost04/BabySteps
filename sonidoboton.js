import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

export default function SonidoBoton({ onPress, title, style, textStyle }) {
  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/boton.mp3') // Cambia la ruta al archivo de sonido
      );
      await sound.playAsync();
      // Libera el sonido después de reproducirlo
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error al reproducir el sonido:', error);
    }
  };

  const handlePress = () => {
    playSound();
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.button, style]}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});