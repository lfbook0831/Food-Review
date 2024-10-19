import { signInWithGoogle, signOutUser } from '../lib/auth';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser ? authUser : null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header>
      <h1>Welcome to Food Review App</h1>
      {user ? (
        <>
          <p>Hello, {user.displayName}</p>
          <button onClick={signOutUser}>Sign Out</button>
        </>
      ) : (
        <button onClick={signInWithGoogle}>Sign In with Google</button>
      )}
    </header>
  );
}
