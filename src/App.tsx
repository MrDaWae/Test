import { useState } from "react";

import "./App.css";

import { GameManager } from "./core/GameManager";
import { megaManGame } from "./games/megaman/config";
import {
  megaManModes,
  type GameMode,
} from "./games/megaman/modes";

function App() {
  const [gameManager] = useState(
    () => new GameManager()
  );

  const [selectedGame, setSelectedGame] =
    useState(false);

  const [selectedMode, setSelectedMode] =
    useState<GameMode | null>(null);

  function selectMegaMan() {
    gameManager.selectGame(megaManGame);
    setSelectedGame(true);
  }

  function selectMode(mode: GameMode) {
    setSelectedMode(mode);
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

  if (!selectedMode) {
    return (
      <div className="app">
        <h1>Mega Man Gamedle</h1>

        <p>
          Choisissez un mode de jeu :
        </p>

        <div>
          {megaManModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => selectMode(mode)}
            >
              <strong>{mode.name}</strong>
              <br />
              <small>{mode.description}</small>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Mega Man Gamedle</h1>

      <h2>{selectedMode.name}</h2>

      <p>{selectedMode.description}</p>

      <p>
        Le jeu va bientôt commencer...
      </p>
    </div>
  );
}

export default App;