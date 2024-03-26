// pages/[username].js

import { useRouter } from 'next/router';

export default function UserPage() {
  const router = useRouter();
  const { username } = router.query;

  // Prüfe, ob ein Benutzername vorhanden ist
  if (!username) {
    return <div>Benutzername nicht gefunden</div>;
  }

  // Hier kannst du Logik basierend auf dem Benutzernamen implementieren
  // Zum Beispiel:
  const userDetails = {
    alice: { name: 'Alice', age: 30 },
    bob: { name: 'Bob', age: 25 },
    // Weitere Benutzer hinzufügen...
  };

  const user = userDetails[username];

  // Wenn der Benutzer nicht gefunden wurde
  if (!user) {
    return <div>Benutzer "{username}" nicht gefunden</div>;
  }

  // Wenn der Benutzer gefunden wurde, zeige die Informationen an
  return (
    <div>
      <h1>Benutzerdetails:</h1>
      <p>Name: {user.name}</p>
      <p>Alter: {user.age}</p>
    </div>
  );
}
