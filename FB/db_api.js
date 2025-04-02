import app from "./Firebase";
import { getDatabase, ref, set, get } from "firebase/database";

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

export { createRef, guardarCuenta, leerCuenta };
