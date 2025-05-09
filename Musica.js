import React, { useEffect } from 'react';
import { Audio } from 'expo-av';

let sound;

export default function Musica() {
  useEffect(() => {
    const playMusic = async () => {
      try {
        sound = new Audio.Sound();
        await sound.loadAsync(require('./assets/musica.mp3')); // Cambia la ruta al archivo de tu canción
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
      } catch (error) {
        console.error('Error al reproducir la música:', error);
      }
    };

    playMusic();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  return null; // Este componente no renderiza nada
}