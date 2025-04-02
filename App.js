import React, { useState } from 'react';
import Prin from './screens/prin';
import Inicio from './screens/Inicio';
import Signup from './screens/Signup';
import Home from './screens/Home';
import Nutricion from './screens/Nutricion';
import Sueno from './screens/Sueno';
import Perfil from './screens/Perfil';
import CitasCartilla from './screens/CitasCartilla';
import FAQ from './screens/FAQ';

// Fonts
import { useFonts } from 'expo-font';
import { Lobster_400Regular } from '@expo-google-fonts/lobster';
import { Montserrat_500Medium_Italic } from '@expo-google-fonts/montserrat';
import { OpenSans_400Regular, OpenSans_400Italic } from '@expo-google-fonts/open-sans';
import { PlayfairDisplay_400Italic } from '@expo-google-fonts/playfair-display';
import { Raleway_400Italic } from '@expo-google-fonts/raleway';
import { Merriweather_400Italic } from '@expo-google-fonts/merriweather';

export default function App() {
  const [fontsLoaded] = useFonts({
    Lobster_Regular: Lobster_400Regular,
    OpenSans_Regular: OpenSans_400Regular,
    OpenSans_Italic: OpenSans_400Italic,
    Playfair_Italic: PlayfairDisplay_400Italic,
    Raleway_Italic: Raleway_400Italic,
    Merriweather_Italic: Merriweather_400Italic,
    Montserrat_500Medium_Italic: Montserrat_500Medium_Italic,
  });

  const [pantalla, setPantalla] = useState('prin');


  let contenido = <Prin setPantalla={setPantalla} />;

  if (pantalla === 'Inicio') contenido = <Inicio setPantalla={setPantalla} />;
  else if (pantalla === 'Signup') contenido = <Signup setPantalla={setPantalla} />;
  else if (pantalla === 'Home') contenido = <Home setPantalla={setPantalla} />;
  else if (pantalla === 'Nutricion') contenido = <Nutricion setPantalla={setPantalla} />;
  else if (pantalla === 'Sueno') contenido = <Sueno setPantalla={setPantalla} />;
  else if (pantalla === 'Perfil') contenido = <Perfil setPantalla={setPantalla} />;
  else if (pantalla === 'CitasCartilla') contenido = <CitasCartilla setPantalla={setPantalla} />;
  else if (pantalla === 'FAQ') contenido = <FAQ setPantalla={setPantalla} />;

  return <>{contenido}</>;
}
