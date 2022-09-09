import { GameObjects } from 'phaser';
import { GameScene1 } from './gameScene1';

export class GameScene2 extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  obstacle!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  movingPlatform!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  stars!: Phaser.Physics.Arcade.Group;
  sceneIndex = 2;

  constructor() {
    super({ active: false, visible: false });
    Phaser.Scene.call(this, { key: `GameScene${this.sceneIndex}`  });
  }

  init(data: any) {
    console.log('init', data);
  }

  preload() {
    this.load.image('sky', 'assets/images/sky.png');
    this.load.image('ground', 'assets/images/platform.png');
    this.load.image('star', 'assets/images/star.png');
    this.load.spritesheet('dude', 'assets/images/dude.png', {
      frameWidth: 32,
      frameHeight: 48
    });
    // this.scene.add(`GameScene${this.sceneIndex - 1}`, GameScene1, false);
  }

  create() {
    this.add.image(400, 300, 'sky');
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.movingPlatform = this.physics.add.image(400, 400, 'ground');

    this.movingPlatform.setImmovable(true);
    this.movingPlatform.body.allowGravity = false;
    this.movingPlatform.setVelocityX(50);

    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.stars.children.iterate((child) => {
      child.body.gameObject.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.movingPlatform);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.stars, this.movingPlatform);

    this.physics.add.overlap(this.player, this.stars, GameScene1.collectStar);
  }

  update() {
    const { cursors, player, movingPlatform } = this;
    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play('left', true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.anims.play('right', true);
    } else {
      player.setVelocityX(0);
      player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-330);
    }

    if (movingPlatform.x >= 500) {
      movingPlatform.setVelocityX(-50);
    } else if (movingPlatform.x <= 300) {
      movingPlatform.setVelocityX(50);
    }

    if (player.x >= 784) {
      this.nextScene();
    }
  }

  static collectStar(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    star: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const star2 = star as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    star2.disableBody(true, true);
  }

  nextScene() {
    this.scene.start(`GameScene${this.sceneIndex - 1}`);
  }
}
