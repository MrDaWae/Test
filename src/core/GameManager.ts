import type { GameDefinition } from "./Game";

export class GameManager {
  private game: GameDefinition | null = null;

  selectGame(game: GameDefinition) {
    this.game = game;

    console.log(
      "🎮 Variante sélectionnée :",
      game.name
    );
  }

  getGame() {
    return this.game;
  }

  hasGame() {
    return this.game !== null;
  }
}