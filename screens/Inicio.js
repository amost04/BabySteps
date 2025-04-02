import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, useWindowDimensions, ImageBackground, Image, Dimensions, PixelRatio, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { Montserrat_500Medium_Italic } from '@expo-google-fonts/montserrat';
import { signIn } from '../FB/auth_app'; 

// Función para normalizar tamaños según la pantalla
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

function normalize(size) {
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export default function Inicio({ setPantalla }) {
    let [fontsLoaded] = useFonts({
        Montserrat_500Medium_Italic: Montserrat_500Medium_Italic
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
          Alert.alert('Error', 'Por favor, ingresa tu correo y contraseña.');
          return;
        }
      
        const user = await signIn(email, password);
        if (user) {
          setPantalla('Home');
        } else {
          // Ya muestra el error desde la función signIn
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
                    <TouchableOpacity onPress={() => setPantalla('prin')} style={styles.returnButton}>
                        <Image source={require('../assets/return.png')} style={styles.returnIcon} />
                    </TouchableOpacity>
                    <Image source={require('../assets/bslogo.png')} style={styles.logo} />
                    <Text style={styles.title}>Inicia Sesión</Text>
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

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Confirmar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setPantalla('Signup')}>
                        <Text style={styles.linkText}>¿No tienes cuenta? Crear cuenta</Text>
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
        paddingVertical: normalize(30)
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
        left: normalize(10)
    },
    logo: {
        width: normalize(200),
        height: normalize(200),
        position: 'absolute',
        centre: normalize(30),
        top: normalize(45)
    },
    title: {
        fontSize: normalize(40),
        marginBottom: normalize(20),
        fontWeight: 'bold',
        fontFamily: 'Montserrat_500Medium_Italic'
    },
    input: {
        width: '80%',
        height: normalize(50),
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: normalize(15),
        marginVertical: normalize(10),
        backgroundColor: '#fff'
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
        textDecorationLine: 'underline'
    }
});
