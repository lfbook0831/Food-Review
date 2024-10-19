import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export function onAuthStateChanged(cb) {
  const auth = getAuth();
  return onAuthStateChanged(auth, cb);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
}

export async function signOutUser() {
  const auth = getAuth();
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
}
