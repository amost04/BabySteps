import app from "./Firebase";
import {getAuth, crateUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, delateUser, createUserWithEmailAndPassword} from "firebase/auth";
const authInstance = getAuth(app);

async function singUp (correo, contraseña) {
    createUserWithEmailAndPassword(authInstance, correo, contraseña)
}
export{
    singUp
}