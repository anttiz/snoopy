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
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  obstacles?: Phaser.Physics.Arcade.StaticGroup;
  movingPlatform!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  dangerous?: Phaser.Physics.Arcade.Group;
  dangerousCopy?: Phaser.Physics.Arcade.Group;
  movingObstacles?: Phaser.Physics.Arcade.Group;
  movingObstacles2?: Phaser.Physics.Arcade.Group;
  isJumping = false;
  isDead = false;
  sceneIndex!: number;
  roomIndex: number = 0;
  playerGroundCollider!: Phaser.Physics.Arcade.Collider;
  music!: Phaser.Sound.BaseSound;
  timedEvent!: Phaser.Time.TimerEvent;
  dangerousVisible = false;
  dangerousCollider?: Phaser.Physics.Arcade.Collider = undefined;
  platformCollider?: Phaser.Physics.Arcade.Collider = undefined;

  constructor({ sceneIndex }: Props) {
    super({ active: false, visible: false });
    this.sceneIndex = sceneIndex;
    this.roomIndex = 0;
    const key = `GameScene${sceneIndex}`;
    Phaser.Scene.call(this, { key });
  }

  init(data: InitParams) {
    if (data && data.roomIndex) {
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
    this.load.image('rock', 'assets/images/rock.png');
    this.load.spritesheet('dog', 'assets/images/dog.png', {
      margin: 0,
      spacing: 0,
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image('vertical_obstacle', 'assets/images/vertical_obstacle.png');
    this.load.image('edge', 'assets/images/edge.png');
    this.load.image('water', 'assets/images/water.png');
    this.load.image('laser', 'assets/images/laser.png');
    this.load.image('ferry', 'assets/images/ferry.png');
    this.load.image('gray_level', 'assets/images/gray_level.png');
    this.load.image('gray_block_200', 'assets/images/gray_level_200x200.png');
    this.load.image(
      'gray_block_100_200',
      'assets/images/gray_level_100x200.png'
    );

    // this.load.audio('gameover', ['assets/music/fallingdown.mp3']);
    this.load.audio('gameover', ['assets/music/falling-bomb-41038.mp3']);
  }

  createAnims() {
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dog', { start: 52, end: 55 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dog', frame: 36 }],
      frameRate: 20
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dog', { start: 5, end: 8 }),
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

  createMusic() {
    this.music = this.game.sound.add('gameover', {
      loop: false,
      volume: 0.1
    });
  }

  createDangerous() {
    let roomIndex = this.roomIndex;
    this.dangerous = undefined;
    this.obstacles = undefined;
    this.movingObstacles = undefined;
    this.movingObstacles2 = undefined;

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
    } else if (roomIndex === 1) {
      this.dangerous = this.physics.add.group({
        key: 'rock',
        repeat: 2,
        setXY: { x: END_X / 2, y: END_Y, stepX: 300 }
      });
      this.dangerous.children.iterate((child) => {
        child.body.gameObject.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.body.gameObject.setVelocityX(-100 - 10 * roomIndex);
      });
    } else if (roomIndex === 2) {
      const offset = 200;
      this.obstacles = this.physics.add.staticGroup({
        key: 'vertical_obstacle',
        repeat: 2,
        setXY: { x: 300, y: 220, stepX: offset }
      });
    } else if (roomIndex === 3) {
      const offset = 200;
      this.obstacles = this.physics.add.staticGroup({
        key: 'vertical_obstacle',
        repeat: 2,
        setXY: { x: 300, y: 220, stepX: offset }
      });
      this.dangerous = this.physics.add.group({
        key: 'rock',
        repeat: 0,
        setXY: { x: END_X / 2, y: END_Y, stepX: 300 }
      });

      this.dangerous.children.iterate((child) => {
        child.body.gameObject.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.body.gameObject.setVelocityX(-100 - 10 * roomIndex);
      });
    } else if (roomIndex === 4 || roomIndex === 5) {
      const offset = 320;
      this.obstacles = this.physics.add.staticGroup({
        key: 'edge',
        repeat: 1,
        setXY: { x: 300, y: END_Y + 15, stepX: offset }
      });
      const ferryX = [370, 530];
      this.movingObstacles = this.physics.add.group({
        key: 'ferry',
        repeat: 0,
        setXY: { x: 430, y: END_Y + 12, stepX: 160 },
        immovable: true,
        allowGravity: false,
        'setScale.x': 1.5,
        'setScale.y': 1
      });
      if (roomIndex === 5) {
        this.movingObstacles.children.iterate((child) => {
          child.body.gameObject.setVelocityX(-50);
        });
      }
      this.dangerous = this.physics.add.group({
        key: 'water',
        repeat: 0,
        setXY: { x: 460, y: END_Y + 30, stepX: 0 },
        immovable: true,
        allowGravity: false
      });
    } else if (roomIndex === 6) {
      this.obstacles = this.physics.add.staticGroup({
        key: 'gray_level',
        repeat: 0,
        setXY: { x: 550, y: 455, stepX: 100 }
      });

      this.movingObstacles = this.physics.add.group({
        key: 'ferry',
        repeat: 0,
        setXY: { x: 240, y: END_Y + 45, stepX: 160 },
        immovable: true,
        allowGravity: false,
        'setScale.x': 1.5,
        'setScale.y': 1
      });
    } else if (roomIndex === 7) {
      this.obstacles = this.physics.add.staticGroup({
        key: 'gray_block_100_200',
        repeat: 2,
        setXY: { x: 220, y: 455, stepX: 300 }
      });

      this.movingObstacles = this.physics.add.group({
        key: 'ferry',
        repeat: 2,
        setXY: { x: 150, y: END_Y + 45, stepX: 300 },
        immovable: true,
        allowGravity: false,
        'setScale.x': 0.5,
        'setScale.y': 1
      });
      this.movingObstacles2 = this.physics.add.group({
        key: 'ferry',
        repeat: 2,
        setXY: { x: 310, y: 365, stepX: 300 },
        immovable: true,
        allowGravity: false,
        'setScale.x': 1,
        'setScale.y': 1
      });
    } else if (roomIndex === 8) {
      const offset = 320;
      this.obstacles = this.physics.add.staticGroup({
        key: 'edge',
        repeat: 1,
        setXY: { x: 300, y: END_Y + 20, stepX: offset },
        'setScale.y': 0.7
      });
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.onTimedEvent,
        callbackScope: this
      });
      this.dangerous = this.physics.add.group({
        key: 'laser',
        repeat: 0,
        setXY: { x: 460, y: END_Y + 20, stepX: 0 },
        immovable: true,
        allowGravity: false,
        'setScale.y': 0.2
      });
      this.dangerousVisible = true;
    }
  }

  create() {
    this.add.image(400, 300, 'sky');
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.player = this.physics.add.sprite(100, 450, 'dog').setScale(1.5);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.createAnims();
    this.createKeys();
    this.createDangerous();
    this.createMusic();

    this.playerGroundCollider = this.physics.add.collider(
      this.player,
      this.platforms
    );
    if (this.obstacles) {
      this.physics.add.collider(this.player, this.obstacles);
    }
    this.addDangerousCollider();
    if (this.movingObstacles) {
      this.physics.add.collider(this.player, this.movingObstacles);
    }
    if (this.movingObstacles2) {
      this.physics.add.collider(this.player, this.movingObstacles2);
    }
  }

  updateMovingObstacles() {
    if (this.roomIndex === 5) {
      this.movingObstacles?.children.iterate((child) => {
        if (child.body.position.x < 310) {
          child.body.gameObject.setVelocityX(50);
        }
        if (child.body.position.x > 490) {
          child.body.gameObject.setVelocityX(-50);
        }
      });
    } else if (this.roomIndex === 6) {
      // move lift
      this.movingObstacles?.children.iterate((child) => {
        // lift will start to move up
        if (this.player.x > 250 && child.body.velocity.y === 0) {
          child.body.gameObject.setVelocityY(-50);
        }
        // lift will start moving down
        if (
          this.player.x < 260 &&
          child.body.velocity.y === 0 &&
          child.body.position.y > 350 &&
          child.body.position.y < 360
        ) {
          child.body.gameObject.setVelocityY(50);
        }
        // lift will stop when going up
        if (child.body.position.y < 355 && child.body.velocity.y === -50) {
          child.body.gameObject.setVelocityY(0);
        }
        // lift will stop when going down
        if (child.body.position.y > 535 && child.body.velocity.y === 50) {
          child.body.gameObject.setVelocityY(0);
        }
      });
    } else if (this.roomIndex === 7) {
      // move lift
      this.movingObstacles?.children.iterate((child) => {
        // lift will start to move up
        const startX = child.body.position.x;
        const endX = child.body.position.x + child.body.gameObject.width;
        if (
          this.player.x > startX &&
          this.player.x < endX &&
          child.body.velocity.y === 0 &&
          child.body.position.y > 500
        ) {
          child.body.gameObject.setVelocityY(-50);
        }
        // lift will stop when going up
        if (child.body.position.y < 355 && child.body.velocity.y === -50) {
          child.body.gameObject.setVelocityY(0);
          child.body.velocity.y = 0;
        }
      });
      this.movingObstacles2?.children.iterate((child) => {
        // lift will start to move up
        const startX = child.body.position.x;
        const endX = child.body.position.x + child.body.gameObject.width;
        if (
          this.player.x > startX &&
          this.player.x < endX &&
          child.body.velocity.y === 0 &&
          child.body.position.y > 350 &&
          child.body.position.y < 360
        ) {
          child.body.gameObject.setVelocityY(50);
        }
        // lift will stop when going down
        if (child.body.position.y > 535 && child.body.velocity.y === 50) {
          child.body.gameObject.setVelocityY(0);
        }
      });
    }
  }

  update() {
    const { cursors, player, spaceButton } = this;
    if (player.y >= END_Y + 100) {
      // fallen too much
      this.restartScene();
    }
    if (this.isDead) return;
    if (!this.isJumping) {
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
    if (this.dangerous && this.dangerous.children) {
      this.dangerous.children.iterate((child) => {
        if (child.body.position.x < 10) {
          child.body.position.x = END_X;
        }
      });
    }

    this.updateMovingObstacles();

    if (player.x >= END_X) {
      this.nextScene();
    }
  }

  removeDangerousCollider() {
    if (this.platformCollider) {
      this.physics.world.removeCollider(this.platformCollider);
      this.platformCollider = undefined;
    }
    if (this.dangerousCollider) {
      this.physics.world.removeCollider(this.dangerousCollider);
      this.dangerousCollider = undefined;
    }
  }

  addDangerousCollider() {
    if (this.dangerous) {
      this.platformCollider = this.physics.add.collider(
        this.dangerous,
        this.platforms
      );
      this.dangerousCollider = this.physics.add.overlap(this.player, this.dangerous, (player, rock) => {
        this.hitDangerous()
      });
    }
  }

  onTimedEvent() {
    if (this.roomIndex === 8) {
      if (this.dangerousVisible) {
        this.removeDangerousCollider();
        this.dangerous?.clear(true);
      } else {
        this.dangerous = this.physics.add.group({
          key: 'laser',
          repeat: 0,
          setXY: { x: 460, y: END_Y + 20, stepX: 0 },
          immovable: true,
          allowGravity: false,
          'setScale.y': 0.2
        });
        this.addDangerousCollider();
      }
      this.timedEvent = this.time.addEvent({
        delay: this.dangerousVisible ? 1000 : 100,
        callback: this.onTimedEvent,
        callbackScope: this
      });
      this.dangerousVisible = !this.dangerousVisible;
    }
  }

  nextScene() {
    this.scene.restart({ roomIndex: this.roomIndex + 1 });
  }

  restartScene() {
    this.isDead = false;
    this.music.stop();
    this.scene.restart();
  }

  hitDangerous() {
    this.music.play();
    this.player.setVelocityX(0);
    this.player.setVelocityY(50);
    this.player.body.allowGravity = false;
    this.physics.world.removeCollider(this.playerGroundCollider);
    this.player.setCollideWorldBounds(false);
    this.isDead = true;
  }
}
