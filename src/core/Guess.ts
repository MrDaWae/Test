export type GuessResult =
  | {
      correct: true;
      answer: string;
    }
  | {
      correct: false;
    };