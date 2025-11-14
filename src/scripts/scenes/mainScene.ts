import FpsText from '../objects/fpsText'

export default class MainScene extends Phaser.Scene {
  fpsText
  player!: Phaser.Physics.Arcade.Sprite
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  score: number = 0
  scoreText!: Phaser.GameObjects.Text
  buckets!: Phaser.Physics.Arcade.StaticGroup
  obstacles!: Phaser.Physics.Arcade.StaticGroup
  gameOver: boolean = false
  spawnTimer: number = 0
  ground!: Phaser.GameObjects.Rectangle
  restartButton!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    this.textures.get('obstacle').setFilter(Phaser.Textures.FilterMode.NEAREST)

    this.fpsText = new FpsText(this)
    this.cursors = this.input.keyboard.createCursorKeys()

    //  Invisible rectangle ground
    this.ground = this.add.rectangle(640, 700, 100000, 40, 0xffffff, 0)
    this.physics.add.existing(this.ground, true)

    //  Phippy
    this.player = this.physics.add.sprite(150, 660, 'phippy')
    this.player.setCollideWorldBounds(true)
    this.player.setScale(0.15)

    //  Camera
    this.physics.world.setBounds(0, 0, 100000, 720)
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, 100000, 720)

    // Static groups
    this.buckets = this.physics.add.staticGroup()
    this.obstacles = this.physics.add.staticGroup()

    // Collisions
    this.physics.add.collider(this.player, this.ground)
    this.physics.add.collider(this.buckets, this.ground)
    this.physics.add.collider(this.obstacles, this.ground)
    this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, undefined, this)
    this.physics.add.overlap(this.player, this.buckets, this.collectBucket, undefined, this)

    // Score UI
    this.scoreText = this.add.text(16, 16, 'LGTM: 0', {
      fontSize: '24px',
      color: '#000000'
    }).setScrollFactor(0)
  }

  update(time: number, delta: number) {
    if (this.gameOver) return

    this.fpsText.update()
    this.player.setVelocityX(150)

    if (this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-330)
    }

    this.spawnTimer += delta
    if (this.spawnTimer > 1500) {
      this.spawnTimer = 0

      const x = this.player.x + 800
      const y = 660

      // Bucket
      const bucket = this.buckets.create(x, y, 'bucket')
      if (bucket) {
        bucket.setScale(0.1)
        bucket.refreshBody()
      }

      const jumpButton = this.add.text(
        20,
        this.cameras.main.height - 100,
        '⬆️',
        {
          fontSize: '48px',
          backgroundColor: '#ffffff',
          color: '#000000',
          padding: { x: 10, y: 5 },
        }
      )
        .setScrollFactor(0)
        .setInteractive()
        .on('pointerdown', () => {
          if (this.player.body.blocked.down) {
            this.player.setVelocityY(-330)
          }
        })
      


      // Bug obstacle (small)
      if (Phaser.Math.Between(0, 1)) {
        const obstacle = this.obstacles.create(x + 50, y, 'obstacle')
        if (obstacle) {
          obstacle.setScale(0.025)
          obstacle.refreshBody()
          obstacle.body.setSize(26, 26).setOffset(2, 2)
        }
      }
    }
  }

  collectBucket(player: Phaser.GameObjects.GameObject, bucket: Phaser.GameObjects.GameObject) {
    bucket.destroy()
    this.score += 1
    this.scoreText.setText('Buckets: ' + this.score)
  }

  hitObstacle() {
    if (this.gameOver) return
    this.gameOver = true
    this.player.setTint(0xff0000)
    this.player.setVelocity(0)

    const centerX = this.cameras.main.scrollX + this.cameras.main.width / 2

    this.restartButton = this.add.text(centerX, 360, 'Game Over', {
      fontSize: '36px',
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.restart()
      })
  }
}
