import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import prin from './screens/prin';

// Fonts
import { useFonts } from 'expo-font';
import { Lobster_400Regular } from '@expo-google-fonts/lobster';
import { Montserrat_500Medium_Italic } from '@expo-google-fonts/montserrat';
import { OpenSans_400Regular, OpenSans_400Italic } from '@expo-google-fonts/open-sans';
import { PlayfairDisplay_400Italic } from '@expo-google-fonts/playfair-display';
import { Raleway_400Italic } from '@expo-google-fonts/raleway';
import { Merriweather_400Italic } from '@expo-google-fonts/merriweather';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Lobster_Regular: Lobster_400Regular,
    OpenSans_Regular: OpenSans_400Regular,
    OpenSans_Italic: OpenSans_400Italic,
    Playfair_Italic: PlayfairDisplay_400Italic,
    Raleway_Italic: Raleway_400Italic,
    Merriweather_Italic: Merriweather_400Italic,
    Montserrat_500Medium_Italic: Montserrat_500Medium_Italic
  });

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="prin">
        <Stack.Screen
          name="prin"
          component={prin}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
