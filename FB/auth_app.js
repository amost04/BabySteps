// auth_app.js
import app from "./Firebase";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  deleteUser,
} from "firebase/auth";

const authInstance = getAuth(app);

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
async function signIn(correo, contraseña) {
    var confirmacion= await signInWithEmailAndPassword(authInstance, correo, contraseña).then((user)=>{
        if (user.user.emailVerified){
            alert('Verifica tu cuenta para iniciar sesión')
            return(user.user)
        }else{
            return(false)
        }
        return(user.user)
    }).catch((error)=>{
        alert("❌ " + error.message);
        return(false)
    })
    return(confirmacion)
}
export {
  signUp,
  signIn
};
