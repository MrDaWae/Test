export interface HintProvider {
  createHint(): boolean;
}

export class HintManager {
  constructor(
    private readonly provider: HintProvider
  ) {}

  onCorrectGuess() {
    console.log(
      "💡 Bonne réponse → création d'un Hint"
    );

    return this.provider.createHint();
  }
}