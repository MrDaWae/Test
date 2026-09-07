import type { HintProvider } from "../core/HintManager";
import type { APClient } from "./APClient";

export class APHintProvider
  implements HintProvider
{
  constructor(
    private readonly client: APClient
  ) {}

  createHint() {
    return this.client.createHint();
  }
}