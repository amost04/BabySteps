import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref as dbRef, onValue } from 'firebase/database';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function GraficaBiometrica() {
  const [datos, setDatos] = useState([]);
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const ref = dbRef(db, `usuarios/${user.uid}/biometricoHistorial`);

    onValue(ref, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const array = Object.entries(val).map(([key, value]) => ({ id: key, ...value }));
        setDatos(array);
      } else {
        setDatos([]);
      }
    });
  }, [user]);

  if (datos.length === 0) return null;

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <LineChart
        data={{
          labels: datos.map(d => d.fecha),
          datasets: [
            { data: datos.map(d => d.peso), color: () => '#60A5FA', strokeWidth: 2 },
            { data: datos.map(d => d.altura), color: () => '#34D399', strokeWidth: 2 },
            { data: datos.map(d => d.temperatura), color: () => '#FBBF24', strokeWidth: 2 },
          ],
          legend: ['Peso (Kg)', 'Altura (cm)', 'Temperatura °C'],
        }}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#f0f0f0',
          backgroundGradientTo: '#fff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={{ borderRadius: 10 }}
      />
    </View>
  );
}
