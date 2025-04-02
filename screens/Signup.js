import React, { useState } from 'react';
import {
  KeyboardAvoidingView, ScrollView, View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ImageBackground, Image, Dimensions, PixelRatio,
  useWindowDimensions, Platform
} from 'react-native';
import { useFonts } from 'expo-font';
import { Montserrat_500Medium_Italic } from '@expo-google-fonts/montserrat';
import { signUp } from '../FB/auth_app'; // Ya corregido el nombre
import { guardarCuenta } from '../FB/db_api';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function Signup({ setPantalla }) {
  const [fontsLoaded] = useFonts({
    Montserrat_500Medium_Italic
  });

  const [babyName, setBabyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (!babyName || !birthDate || !parentName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
  
    const resultado = await signUp(email, password);
    if (resultado) {
      await guardarCuenta(resultado.uid, babyName, birthDate, parentName, email);
      Alert.alert('Éxito', 'Cuenta creada y datos guardados.');
      setPantalla('Inicio');
    }
  };
  

  const { width: wW, height: wH } = useWindowDimensions();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <ImageBackground source={require('../assets/bw.png')} style={[styles.container, { width: wW, height: wH }]}>
          <TouchableOpacity onPress={() => setPantalla('Inicio')} style={styles.returnButton}>
            <Image source={require('../assets/return.png')} style={styles.returnIcon} />
          </TouchableOpacity>
          <Image source={require('../assets/bslogo.png')} style={styles.logo} />
          <Text style={styles.title}>Crear Cuenta</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre del bebé"
            value={babyName}
            onChangeText={setBabyName}
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha de nacimiento (dd/mm/aaaa)"
            value={birthDate}
            onChangeText={setBirthDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre del padre o madre"
            value={parentName}
            onChangeText={setParentName}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar Contraseña"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Confirmar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPantalla('Inicio')}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? Iniciar sesión</Text>
          </TouchableOpacity>
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(30),
  },
  returnButton: {
    position: 'absolute',
    top: normalize(20),
    left: normalize(20),
    zIndex: 10,
  },
  returnIcon: {
    width: normalize(40),
    height: normalize(40),
    top: normalize(45),
    left: normalize(10),
  },
  logo: {
    width: normalize(200),
    height: normalize(200),
    position: 'absolute',
    top: normalize(45),
  },
  title: {
    fontSize: normalize(40),
    marginBottom: normalize(20),
    fontWeight: 'bold',
    fontFamily: 'Montserrat_500Medium_Italic',
  },
  input: {
    width: '80%',
    height: normalize(50),
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: normalize(15),
    marginVertical: normalize(10),
    backgroundColor: '#fff',
  },
  button: {
    marginTop: normalize(20),
    backgroundColor: '#6499fa',
    padding: normalize(15),
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: normalize(18),
  },
  linkText: {
    marginTop: normalize(15),
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
