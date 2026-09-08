import { useState } from "react";
import "./App.css";

import { GameManager } from "./core/GameManager";
import { megaManGame } from "./games/megaman/config";

function App() {
  const [gameManager] = useState(
    () => new GameManager()
  );

  const [selectedGame, setSelectedGame] =
    useState(false);

  function selectMegaMan() {
    gameManager.selectGame(megaManGame);
    setSelectedGame(true);
  }

  if (!selectedGame) {
    return (
      <div className="app">
        <h1>Gamedle Archipelago</h1>

        <h2>Choisissez une variante</h2>

        <button onClick={selectMegaMan}>
          🤖 Mega Man
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Mega Man Gamedle</h1>

      <p>
        Variante :
        {" "}
        {gameManager.getGame()?.name}
      </p>

      <p>
        Les modes de jeu arriveront ici.
      </p>
    </div>
  );
}
//test
export default App;