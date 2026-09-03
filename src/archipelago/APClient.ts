export type APConnectionConfig = {
  host: string;
  port: number;
  slot: string;
  password?: string;
};

export class APClient {
  private socket: WebSocket | null = null;
  private config: APConnectionConfig;
  private missingLocations: number[] = [];

  constructor(config: APConnectionConfig) {
    this.config = config;
  }

  connect() {
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

      // Première étape du protocole :
      // demander les données du serveur.
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
    console.error("❌ Impossible de lire le paquet :", error);
  }
};

    this.socket.onerror = (error) => {
      console.error("❌ Erreur WebSocket :", error);
    };

    this.socket.onclose = (event) => {
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
  }

  private send(packet: unknown) {
  if (!this.socket) {
    console.warn("WebSocket inexistant");
    return;
  }

  if (this.socket.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket pas encore ouvert");
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
      case "DataPackage":
        this.handleDataPackage(packet);
        break;

      case "Connected":
        this.handleConnected(packet);
        break;

      case "RoomUpdate":
        console.log("🏠 RoomUpdate :", packet);
        break;

      case "ReceivedItems":
        console.log("🎁 ReceivedItems :", packet);
        break;

      case "Print":
        console.log("💬 Archipelago :", packet.text);
        break;

      case "ConnectionRefused":
        console.error(
          "⛔ Connexion refusée :",
          packet.errors
        );
        break;

      default:
        console.log("📦 Packet non géré :", packet);
    }
  }

  private handleDataPackage(packet: any) {
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
        "Test_hint",
      ],

      password: this.config.password || null,
    });
  }

  private handleConnected(packet: any) {
  console.log("🎮 CONNECTÉ À ARCHIPELAGO !");
  console.log("📋 Informations de connexion :", packet);

  console.log("🎯 Slot :", this.config.slot);
  console.log("🎮 Jeu :", packet.slot_data);

  this.missingLocations = packet.missing_locations ?? [];

  console.log(
    "📍 Locations restantes :",
    this.missingLocations.length
  );

  console.log(
    "📍 IDs des locations :",
    this.missingLocations
  );
}
}