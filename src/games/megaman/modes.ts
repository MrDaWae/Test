export type GameModeId =
  | "main-characters"
  | "characters-enemies"
  | "zoom"
  | "blindtest";

export interface GameMode {
  id: GameModeId;
  name: string;
  description: string;
}

export const megaManModes: GameMode[] = [
  {
    id: "main-characters",
    name: "Personnages principaux",
    description:
      "Devinez un boss ou un personnage principal de Mega Man.",
  },
  {
    id: "characters-enemies",
    name: "Personnages & ennemis",
    description:
      "Devinez un personnage, un boss ou un ennemi de Mega Man.",
  },
  {
    id: "zoom",
    name: "Zoom",
    description:
      "Devinez le niveau à partir d'une image fortement zoomée.",
  },
  {
    id: "blindtest",
    name: "Blindtest",
    description:
      "Écoutez une musique et devinez de quel morceau il s'agit.",
  },
];