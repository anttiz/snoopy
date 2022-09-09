import { GameScene1 } from "./scenes/gameScene1";
import { GameScene2 } from "./scenes/gameScene2";
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
        gravity: { y: 300 },
        debug: true,
      },
    },
    parent: "game",
    backgroundColor: "#0f0f0f",
    scene: [MenuScene, GameScene1, GameScene2],
  };

  return new Phaser.Game(config);
}
