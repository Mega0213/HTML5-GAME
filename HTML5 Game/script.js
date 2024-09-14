var config = {
     type: Phaser.AUTO,
     width: 1400,
     height: 800,
     physics: {
         default: 'arcade',
         arcade: {
             gravity: { y: 300 },
             debug: false
         }
     },
     scene: {
         preload: preload,
         create: create,
         update: update
     }
 };
 
 var player;
 var stars;
 var bombs;
 var platforms;
 var cursors;
 var score = 0;
 var gameOver = false;
 var scoreText;
 var bombCount = 0;
 var bombText;
 var health = 1;
 var healthText;
 
 var game = new Phaser.Game(config);
 
 function preload ()
 {
     this.load.image('sky', 'assets/sky.png');
     this.load.image('ground', 'assets/platform.png');
     this.load.image('bottom', 'assets/ground.png');
     this.load.image('star', 'assets/star.png');
     this.load.image('bomb', 'assets/bomb.png');
     this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
 }
 
 function create ()
 {
     this.add.image(600, 300, 'sky').setScale(2);
 
     platforms = this.physics.add.staticGroup();
 
     platforms.create(400, 800, 'bottom').setScale(6).refreshBody();
 
     platforms.create(1205, 400, 'ground');
     platforms.create(1350, 190, 'ground');
     platforms.create(900, 550, 'ground');
     platforms.create(50, 250, 'ground');
     platforms.create(200, 425, 'ground');
     platforms.create(750, 220, 'ground');

     player = this.physics.add.sprite(100, 450, 'dude');
 
     player.setBounce(0.2);
     player.setCollideWorldBounds(true);
 
     this.anims.create({
         key: 'left',
         frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
         frameRate: 10,
         repeat: -1
     });
 
     this.anims.create({
         key: 'turn',
         frames: [ { key: 'dude', frame: 4 } ],
         frameRate: 20
     });
 
     this.anims.create({
         key: 'right',
         frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
         frameRate: 10,
         repeat: -1
     });
 
     cursors = this.input.keyboard.createCursorKeys();
 
     stars = this.physics.add.group({
         key: 'star',
         repeat: 19,
         setXY: { x: 12, y: 0, stepX: 70 }
     });
 
     stars.children.iterate(function (child) {
 
         child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.8));
 
     });
 
     bombs = this.physics.add.group();
 
     scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#00FF00' });
     bombText = this.add.text(220, 16, 'Bombs: 0', { fontSize: '32px', fill: '#FF0000' });
     healthText = this.add.text(420, 16, 'Health: 1', { fontSize: '32px', fill: '#0000FF' });
 
     this.physics.add.collider(player, platforms);
     this.physics.add.collider(stars, platforms);
     this.physics.add.collider(bombs, platforms);
 
     this.physics.add.overlap(player, stars, collectBattery, null, this);
 
     this.physics.add.collider(player, bombs, hitDangerousEnergy, null, this);
 }
 
 function update ()
 {
     if (gameOver)
     {
        return;
     }
 
     if (cursors.left.isDown)
     {
         player.setVelocityX(-160);
 
         player.anims.play('left', true);
     }
     else if (cursors.right.isDown)
     {
         player.setVelocityX(160);
 
         player.anims.play('right', true);
     }
     else
     {
         player.setVelocityX(0);
 
         player.anims.play('turn');
     }
 
     if (cursors.up.isDown && player.body.touching.down)
     {
         player.setVelocityY(-330);
     }
 }
 
 function collectBattery (player, star)
 {
     star.disableBody(true, true);
 
     score += 1;
     scoreText.setText('Score: ' + score);

     if (score % 35 == 0) {
        health += 1;
        healthText.setText('Health: ' + health);
     }
     if (stars.countActive(true) === 0)
     {
         stars.children.iterate(function (child) {
 
             child.enableBody(true, child.x, 0, true, true);
 
         });
 
         var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
 
         var bomb = bombs.create(x, 16, 'bomb');
         bombCount += 1;
         bombText.setText('Bombs: ' + bombCount);
         bomb.setBounce(1);
         bomb.setCollideWorldBounds(true);
         bomb.setVelocity(Phaser.Math.Between(-300, 300), 20);
         bomb.allowGravity = true;
 
     }
 }
 
 function hitDangerousEnergy (player, bomb) {

    health -= 1;
    healthText.setText('Health: ' + health);
    bombCount -= 1;
    bombText.setText('Bombs: ' + bombCount);
    bomb.setCollideWorldBounds(false);
    bomb.setVelocity(50000);

    if (health <= 0) {
        this.physics.pause();

        player.setTint(0xff0000);

        scoreText.setText('Score: ' + score);

        player.anims.play('turn');

        gameOver = true;

        this.time.delayedCall(3000, () => {
            
            score = 0;
            
            health = 1;
            
            bombCount = 0;

            gameOver = false;

            this.scene.restart();

        });
    }
}