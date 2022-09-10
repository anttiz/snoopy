type Props = {
  sceneIndex: number;
};

type InitParams = {
  roomIndex: number;
};

const END_X = 776;
const END_Y = 500;

export class BaseScene extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  spaceButton!: Phaser.Input.Keyboard.Key;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  obstacle!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  movingPlatform!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  dangerous!: Phaser.Physics.Arcade.Group;
  isJumping = false;
  sceneIndex!: number;
  roomIndex: number = 0;

  constructor({ sceneIndex }: Props) {
    super({ active: false, visible: false });
    this.sceneIndex = sceneIndex;
    this.roomIndex = 1;
    const key = `GameScene${sceneIndex}`;
    Phaser.Scene.call(this, { key });
  }

  init(data: InitParams) {
    if (data && data.roomIndex) {
      console.log('room', data.roomIndex)
      this.roomIndex = data.roomIndex;
    }
  }

  preload() {
    this.load.image('sky', 'assets/images/sky.png');
    this.load.image('ground', 'assets/images/platform.png');
    this.load.spritesheet('dude', 'assets/images/dude.png', {
      frameWidth: 32,
      frameHeight: 48
    });
    this.load.image('rock', 'assets/images/tile_0027.png');
  }

  createAnims() {
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
  }

  createKeys() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceButton = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  createDangerous() {
    const roomIndex = this.roomIndex;
    if (roomIndex === 0) {
      this.dangerous = this.physics.add.group({
        key: 'rock',
        repeat: 3,
        setXY: { x: END_X / 3, y: END_Y, stepX: 200 }
      });

      this.dangerous.children.iterate((child) => {
        child.body.gameObject.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.body.gameObject.setVelocityX(0);
      });
    } else if (roomIndex < 5) {
      this.dangerous = this.physics.add.group({
        key: 'rock',
        repeat: 2,
        setXY: { x: END_X/2, y: END_Y, stepX: 300 }
      });

        this.dangerous.children.iterate((child) => {
          child.body.gameObject.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
          child.body.gameObject.setVelocityX(-100 - 10 * roomIndex);
        });
    }
  }

  create() {
    this.add.image(400, 300, 'sky');
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.player = this.physics.add.sprite(100, 450, 'dude').setScale(1.5);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.createAnims();
    this.createKeys();
    this.createDangerous();

    this.physics.add.collider(this.dangerous, this.platforms);
    this.physics.add.collider(this.player, this.platforms);

    this.physics.add.overlap(this.player, this.dangerous, (player, rock) =>
      this.hitTheRock()
    );
  }

  update() {
    const { cursors, player, movingPlatform, spaceButton } = this;
    if (true /* !this.isJumping */) {
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
    } else if (player.body.touching.down) {
      this.isJumping = false;
    }

    if (spaceButton.isDown && player.body.touching.down) {
      player.setVelocityY(-330);
      this.isJumping = true;
    }
    this.dangerous.children.iterate((child) => {
      if (child.body.position.x < 10) {
        child.body.position.x = END_X;
      }
    });
    if (player.x >= END_X) {
      this.nextScene();
    }
  }

  nextScene() {
    // this.scene.start(`GameScene${this.sceneIndex}`, { roomIndex: this.roomIndex + 1 });
    console.log(this.roomIndex);
    this.scene.restart({ roomIndex: this.roomIndex + 1 });
  }

  restartScene() {
    this.scene.restart();
  }

  hitTheRock() {
    this.restartScene();
  }
}
