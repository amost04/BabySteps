import app from "./Firebase";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  deleteUser,
} from "firebase/auth";

const authInstance = getAuth(app);

// Registro de usuario y verificación por correo
async function signUp(correo, contraseña) {
  try {
    const response = await createUserWithEmailAndPassword(authInstance, correo, contraseña);
    await sendEmailVerification(response.user);
    alert("✅ Listo, revisa tu correo para verificar tu cuenta.");
    return response.user;
  } catch (error) {
    alert("❌ " + error.message);
    return null;
  }
}

// Inicio de sesión solo si el correo fue verificado
async function signIn(correo, contraseña) {
  try {
    const user = await signInWithEmailAndPassword(authInstance, correo, contraseña);

    if (user.user.emailVerified) {
      return user.user; // ✅ Verificado
    } else {
      alert('⚠️ Verifica tu cuenta antes de iniciar sesión.');
      return false;
    }
  } catch (error) {
    alert("❌ " + error.message);
    return false;
  }
}

export {
  signUp,
  signIn
};
