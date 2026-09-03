import { useState } from "react";
import "./App.css";
import { APClient } from "./archipelago/APClient";

function App() {
  const [apClient] = useState(
  () =>
    new APClient({
      host: "archipelago.gg",
      port: 57925,
      slot: "Tenkaichi2",
    })
);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  const correctAnswer = "zelda";
  

  function checkAnswer() {
    if (answer.trim().toLowerCase() === correctAnswer) {
      setMessage("🎉 Bonne réponse !");
    } else {
      setMessage("❌ Mauvaise réponse !");
    }
  }

  return (
    <div className="app">
      <h1>Gamedle Archipelago</h1>
      <button onClick={() => apClient.connect()}>
          🔌 Connecter à Archipelago
      </button>

        <button onClick={() => apClient.disconnect()}>
          🔌 Déconnecter
        </button>
      <div className="card">
        <h2>Quel est ce jeu ?</h2>

        <p>
          Un célèbre jeu d'aventure avec un héros nommé Link.
        </p>

        <input
          type="text"
          placeholder="Ta réponse..."
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              checkAnswer();
            }
          }}
        />

        <button onClick={checkAnswer}>
          Valider
        </button>

        {message && (
          <p className="message">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;