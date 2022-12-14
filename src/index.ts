import { GameScene } from "./scenes/gameScene";
import { MenuScene } from "./scenes/menuScene";

export function startGame() {
  const config: Phaser.Types.Core.GameConfig = {
    title: "Phaser game",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 700 },
        debug: false,
      },
    },
    parent: "game",
    backgroundColor: "#0f0f0f",
    scene: [/* MenuScene, */ GameScene],
    audio: {
      disableWebAudio: true
    }
  };

  return new Phaser.Game(config);
}
