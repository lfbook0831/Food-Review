import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged as _onAuthStateChanged, signOut as _signOut } from "firebase/auth";
import { auth } from "./clientApp";

export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signOut() {
  return _signOut(auth);
}
