// pages/[username].tsx

import { useRouter } from 'next/router';
import { NextPage } from 'next';

const UsernamePage: NextPage = () => {
  const router = useRouter();
  const { username } = router.query;

  let output = '';

  if (typeof username === 'string') {
    // Hier kannst du logik einfügen, die je nach username variert
    output = `Willkommen, ${username}!`; // Beispieloutput
  } else {
    output = 'Benutzername nicht gefunden';
  }

  return (
    <div>
      <h1>Benutzerseite</h1>
      <p>{output}</p>
    </div>
  );
};

export default UsernamePage;
