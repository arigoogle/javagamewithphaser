import Phaser from "phaser";
import Enemies from "./Enemies"

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
      default: "arcade",
      arcade: {
        gravity:{ y:0 }
      }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
var player
var cursors
var enemies

function preload() {
  this.load.image("tiles", "../assets/assets.png")
  this.load.tilemapTiledJSON("map", "../assets/level1.json")
  this.load.image("background", "../assets/water.png")
  this.load.spritesheet("player", "../assets/player.png", { frameWidth: 32, frameHeight : 64})
  this.load.image("slime", "../assets/slime.png")
}

function create() {
  const map = this.make.tilemap( { key: "map" } )
  const tileset = map.addTilesetImage ("assets", "tiles")

  // background
  this.add.image(600,300, "background")

  // layers
  const lowerLayer = map.createStaticLayer("LowerGround", tileset, 0, 0)
  const groundLayer = map.createStaticLayer("Ground", tileset, 0, 0)
  const grassLayer = map.createStaticLayer("Grass", tileset, 0, 0)
  const worldLayer = map.createStaticLayer("World", tileset, 0, 0)
  const highLayer = map.createStaticLayer("High", tileset, 0, 0)


  // collisions layers
  lowerLayer.setCollisionByProperty({ collides: true})
  groundLayer.setCollisionByProperty({ collides: true})
  worldLayer.setCollisionByProperty({ collides: true})
  highLayer.setDepth(10)

  // player
  const spawnPoint = map.findObject(
      "Player",
      obj => obj.name === "Spawn Point"

  )

  player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player")
  this.physics.add.collider(player, lowerLayer)
  this.physics.add.collider(player, groundLayer)
  this.physics.add.collider(player, worldLayer)

  // enemies
  this.enemies = map.createFromObjects("Enemies", "Enemy", {})
  this.enemiesGroup = new Enemies(this.physics.world, this, {}, this.enemies)
  
  this.physics.add.collider(this.enemiesGroup, lowerLayer)
  this.physics.add.collider(this.enemiesGroup, groundLayer)
  this.physics.add.collider(this.enemiesGroup, worldLayer)
  this.physics.add.collider(this.enemiesGroup, player, hitEnemy, null, this)
  

  // animations
  const anims = this.anims
  anims.create({
      key:"left",
      frames: anims.generateFrameNames("player", {start: 20, end: 29}),
      frameRate: 10,
      repeat: -1
  })

  anims.create({
    key:"right",
    frames: anims.generateFrameNames("player", {start: 30, end: 39}),
    frameRate: 10,
    repeat: -1
  })

  anims.create({
    key:"front",
    frames: anims.generateFrameNames("player", {start: 0, end: 9}),
    frameRate: 10,
    repeat: -1
  })

  anims.create({
    key:"back",
    frames: anims.generateFrameNames("player", {start: 10, end: 19}),
    frameRate: 10,
    repeat: -1
  })

  // camera
  const camera = this.cameras.main
  camera.startFollow(player)
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

  // debug
  // const debug = this.add.graphics().setAlpha(0.75);
  // groundLayer.renderDebug(debug, {
  //   tileColor: null,
  //   collidingTileColor: new Phaser.Display.Color(180, 50, 250, 255),
  //   faceColor: new Phaser.Display.Color(40, 39, 37, 255)
  // });

  

}

function update(){

  const prevVelocity = player.body.velocity.clone()
  player.body.setVelocity(0)
  cursors = this.input.keyboard.createCursorKeys()

  // cursors
  if (cursors.left.isDown) {
      player.body.setVelocityX(-100)
  } else if (cursors.right.isDown){
      player.body.setVelocityX(100)
  } else if (cursors.up.isDown){
      player.body.setVelocityY(-100)
  } else if (cursors.down.isDown){
    player.body.setVelocityY(100)
  }

  if (cursors.left.isDown) {
      player.anims.play("left", true)
  } else if (cursors.right.isDown){
      player.anims.play("right", true)
  } else if (cursors.up.isDown){
      player.anims.play("back", true)
  } else if (cursors.down.isDown){
      player.anims.play("front", true)
  } else {
    player.anims.stop()
      
    // front animation
    if(prevVelocity.x < 0) player.setTexture("player", "left")
    else if (prevVelocity.x > 0) player.setTexture("player", "right")
    else if (prevVelocity.y < 0) player.setTexture("player", "back")
    else if (prevVelocity.y > 0) player.setTexture("player", "front")
  }

}

function hitEnemy(player, enemiesGroup){
  this.scene.restart()
}