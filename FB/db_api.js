import app from "./Firebase";
import { getDatabase, ref, set, get, push } from "firebase/database";

const db = getDatabase(app);
const createRef = (path) => ref(db, path);

// Guardar cuenta del usuario
const guardarCuenta = async (uid, nombreBebe, fechaNacimiento, nombrePadreMadre, correo) => {
  try {
    await set(createRef('usuarios/' + uid), {
      nombreBebe,
      fechaNacimiento,
      nombrePadreMadre,
      correo
    });
    console.log("✅ Cuenta guardada en Realtime Database");
  } catch (error) {
    console.error("❌ Error al guardar cuenta:", error);
  }
};

// Leer cuenta del usuario
const leerCuenta = async (uid) => {
  try {
    const snapshot = await get(createRef('usuarios/' + uid));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.warn("⚠️ No se encontraron datos del usuario.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error al leer datos del usuario:", error);
    return null;
  }
};

// Guardar datos de sueño avanzado con duración formateada
const guardarSuenoAvanzado = async (uid, fecha, horaDormir, horaDespertar, notas) => {
  try {
    // Elimina espacios accidentales
    horaDormir = horaDormir.trim();
    horaDespertar = horaDespertar.trim();
    notas = notas.trim();

    const [h1, m1] = horaDormir.split(":").map(Number);
    const [h2, m2] = horaDespertar.split(":").map(Number);
    const d1 = new Date();
    const d2 = new Date();

    d1.setHours(h1, m1, 0);
    d2.setHours(h2, m2, 0);

    if (d2 < d1) d2.setDate(d2.getDate() + 1);

    const msDiff = d2 - d1;
    const totalMinutes = Math.floor(msDiff / (1000 * 60));
    const horas = Math.floor(totalMinutes / 60);
    const minutos = totalMinutes % 60;
    const duracion = `${horas}h ${minutos}m`;

    const nuevaRef = push(createRef(`usuarios/${uid}/sueno/${fecha}`));
    await set(nuevaRef, {
      horaDormir,
      horaDespertar,
      duracion,
      notas: notas || ""
    });

    console.log("✅ Sueño guardado correctamente con duración:", duracion);
    return true;
  } catch (error) {
    console.error("❌ Error al guardar sueño:", error);
    return false;
  }
};

// Actualizar datos específicos de la cuenta
const updateCuenta = async (uid, nuevosDatos) => {
  try {
    const userRef = createRef('usuarios/' + uid);
    await set(userRef, {
      ...(await leerCuenta(uid)),
      ...nuevosDatos
    });
    console.log("✅ Datos actualizados correctamente");
  } catch (error) {
    console.error("❌ Error al actualizar datos:", error);
  }
};

// Eliminar un campo específico de la cuenta
const removeCampo = async (uid, campo) => {
  try {
    const campoRef = createRef(`usuarios/${uid}/${campo}`);
    await set(campoRef, null);
    console.log(`🗑️ Campo '${campo}' eliminado correctamente`);
  } catch (error) {
    console.error("❌ Error al eliminar campo:", error);
  }
};

export { createRef, guardarCuenta, leerCuenta, guardarSuenoAvanzado,updateCuenta, removeCampo };
