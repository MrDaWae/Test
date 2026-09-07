
export type APConnectionConfig = {
  host: string;
  port: number;
  slot: string;
  password?: string;
};

export type Difficulty =
  | "normal"
  | "difficult"
  | "impossible";

type LocationData = {
  locationId: number;
  itemId: number;
  playerId: number;
  flags: number;
};

export class APClient {
  private socket: WebSocket | null = null;

  private config: APConnectionConfig;

  private missingLocations: number[] = [];

  private locationData = new Map<number, LocationData>();

  private hintedLocations = new Set<number>();

  private connected = false;

  constructor(config: APConnectionConfig) {
    this.config = config;
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.warn("⚠️ Déjà connecté à Archipelago.");
      return;
    }

    const { host, port } = this.config;

    const cleanHost = host
      .replace(/^https?:\/\//, "")
      .replace(/^wss?:\/\//, "")
      .replace(/\/$/, "");

    const url = `wss://${cleanHost}:${port}`;

    console.log("🔌 Connexion à Archipelago :", url);

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("✅ WebSocket connecté");

      this.send({
        cmd: "GetDataPackage",
      });
    };

    this.socket.onmessage = (event) => {
      try {
        const packets = JSON.parse(event.data);

        console.log("📨 Archipelago :", packets);

        if (Array.isArray(packets)) {
          for (const packet of packets) {
            this.handlePacket(packet);
          }
        } else {
          this.handlePacket(packets);
        }
      } catch (error) {
        console.error(
          "❌ Impossible de lire le paquet Archipelago :",
          error
        );
      }
    };

    this.socket.onerror = (error) => {
      console.error("❌ Erreur WebSocket :", error);
    };

    this.socket.onclose = (event) => {
      this.connected = false;

      console.log(
        "🔌 Déconnecté d'Archipelago",
        event.code,
        event.reason
      );
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.connected = false;
  }

  private send(packet: unknown) {
    if (!this.socket) {
      console.warn("⚠️ WebSocket inexistant.");
      return;
    }

    if (this.socket.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket non connecté.");
      return;
    }

    console.log("📤 Envoi :", packet);

    // Archipelago attend une liste de paquets.
    this.socket.send(JSON.stringify([packet]));
  }

  private handlePacket(packet: any) {
    if (!packet || !packet.cmd) {
      return;
    }

    switch (packet.cmd) {
      case "RoomInfo":
        console.log("🏠 RoomInfo :", packet);
        break;

      case "DataPackage":
        this.handleDataPackage();
        break;

      case "Connected":
        this.handleConnected(packet);
        break;

      case "LocationInfo":
        this.handleLocationInfo(packet);
        break;

      case "ReceivedItems":
        console.log("🎁 Items reçus :", packet);
        break;

      case "Print":
        console.log("💬 Archipelago :", packet.text);
        break;

      case "PrintJSON":
        console.log("💬 Archipelago JSON :", packet);
        break;

      case "Bounced":
        console.log("📡 Bounced :", packet);
        break;

      case "ConnectionRefused":
        console.error(
          "⛔ Connexion refusée :",
          packet.errors
        );
        break;

      case "InvalidPacket":
        console.error(
          "⛔ Paquet invalide :",
          packet
        );
        break;

      default:
        console.log(
          "📦 Packet Archipelago non géré :",
          packet
        );
    }
  }

  private handleDataPackage() {
    console.log("📦 DataPackage reçu");

    this.send({
      cmd: "Connect",
      game: "",
      name: this.config.slot,
      uuid: crypto.randomUUID(),

      version: {
        major: 0,
        minor: 5,
        build: 0,
        class: "Version",
      },

      items_handling: 0,

      tags: [
        "HintGame",
        "Gamedle",
      ],

      password: this.config.password || null,
    });
  }

  private handleConnected(packet: any) {
    this.connected = true;

    console.log("🎮 CONNECTÉ À ARCHIPELAGO !");
    console.log("📋 Informations :", packet);

    this.missingLocations =
      packet.missing_locations ?? [];

    console.log(
      "📍 Locations restantes :",
      this.missingLocations.length
    );

    console.log(
      "📍 IDs des locations :",
      this.missingLocations
    );

    // On récupère les informations des locations
    // sans créer de Hint pour l'instant.
    this.scoutLocations();
  }

  /**
   * Demande à Archipelago les informations
   * concernant toutes les locations restantes.
   *
   * create_as_hint: 0
   *
   * IMPORTANT :
   * Cela ne crée aucun Hint et ne fait aucun LocationCheck.
   */
  private scoutLocations() {
    if (this.missingLocations.length === 0) {
      console.warn(
        "⚠️ Aucune location restante à scout."
      );
      return;
    }

    console.log(
      "🔎 Récupération des informations de",
      this.missingLocations.length,
      "locations..."
    );

    this.send({
      cmd: "LocationScouts",
      locations: this.missingLocations,
      create_as_hint: 0,
    });
  }

  /**
   * Reçoit les informations des locations.
   */
  private handleLocationInfo(packet: any) {
    console.log(
      "📍 LocationInfo reçu :",
      packet
    );

    const locations = packet.locations ?? [];

    for (const location of locations) {
      this.locationData.set(
        location.location,
        {
          locationId: location.location,
          itemId: location.item,
          playerId: location.player,
          flags: location.flags,
        }
      );
    }

    console.log(
      "🧠 Locations analysées :",
      this.locationData.size
    );

    this.logClassificationCounts();
  }

  /**
   * Affiche combien de locations appartiennent
   * à chaque classification.
   *
   * Archipelago :
   *
   * 0 = Filler
   * 1 = Progressive / Progression
   * 2 = Useful
   */
  private logClassificationCounts() {
    let filler = 0;
    let useful = 0;
    let progressive = 0;

    for (const location of this.locationData.values()) {
      if ((location.flags & 1) !== 0) {
        progressive++;
      } else if ((location.flags & 2) !== 0) {
        useful++;
      } else {
        filler++;
      }
    }

    console.log("📊 Classification des locations :");
    console.log("   🟢 Filler :", filler);
    console.log("   🔵 Useful :", useful);
    console.log("   🟣 Progressive :", progressive);
  }

  /**
   * Crée TOUJOURS un Hint après une bonne réponse.
   *
   * La difficulté détermine uniquement la probabilité
   * de sélectionner une location Progressive.
   */
  createHint(difficulty: Difficulty) {
    if (!this.connected) {
      console.warn(
        "⚠️ Impossible de créer un Hint : pas connecté."
      );

      return false;
    }

    const availableLocations =
      this.missingLocations.filter(
        (locationId) =>
          !this.hintedLocations.has(locationId)
      );

    if (availableLocations.length === 0) {
      console.warn(
        "⚠️ Plus aucune location disponible."
      );

      return false;
    }

    const progressiveLocations =
      availableLocations.filter((locationId) => {
        const data = this.locationData.get(locationId);

        if (!data) {
          return false;
        }

        // Bit 1 = progression
        return (data.flags & 1) !== 0;
      });

    const normalLocations =
      availableLocations.filter((locationId) => {
        const data = this.locationData.get(locationId);

        if (!data) {
          return false;
        }

        // Tout ce qui n'est pas progression.
        return (data.flags & 1) === 0;
      });

    const progressiveChance =
      this.getProgressiveChance(difficulty);

    const wantsProgressive =
      Math.random() < progressiveChance;

    let selectedLocation: number;

    if (
      wantsProgressive &&
      progressiveLocations.length > 0
    ) {
      selectedLocation =
        this.randomLocation(
          progressiveLocations
        );

      console.log(
        "🟣 Hint PROGRESSIVE sélectionné !"
      );
    } else if (normalLocations.length > 0) {
      selectedLocation =
        this.randomLocation(
          normalLocations
        );

      console.log(
        "🔵 Hint normal sélectionné."
      );
    } else {
      // Fallback :
      // s'il n'y a plus de location normale,
      // on prend obligatoirement une Progressive.
      selectedLocation =
        this.randomLocation(
          progressiveLocations
        );

      console.log(
        "🟣 Fallback vers une location Progressive."
      );
    }

    const data =
      this.locationData.get(selectedLocation);

    console.log(
      "💡 Création du Hint :",
      {
        location: selectedLocation,
        item: data?.itemId,
        flags: data?.flags,
        difficulty,
        progressiveChance,
        progressive: wantsProgressive,
      }
    );

    this.send({
      cmd: "LocationScouts",
      locations: [selectedLocation],
      create_as_hint: 2,
    });

    this.hintedLocations.add(
      selectedLocation
    );

    return true;
  }

  /**
   * Probabilité de cibler une location Progressive.
   */
  private getProgressiveChance(
    difficulty: Difficulty
  ) {
    switch (difficulty) {
      case "normal":
        return 0.20;

      case "difficult":
        return 0.50;

      case "impossible":
        return 0.80;
    }
  }

  /**
   * Choisit une location aléatoire.
   */
  private randomLocation(
    locations: number[]
  ) {
    const index = Math.floor(
      Math.random() * locations.length
    );

    return locations[index];
  }
}

