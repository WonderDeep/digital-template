//creates the playing screen
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('level1', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'assets/tiles-1.png');
    game.load.spritesheet('cat', 'assets/cat.png', 32, 48);
    game.load.spritesheet('ghost', 'assets/droid.png', 32, 32);
    game.load.image('background', 'assets/background2.jpg');
    game.load.image('bullet', 'assets/bullet.png');

}

var map;
var tileset;
var layer;
var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var bg;
var bullets;
var nextFire = 0;
var fireRate = 100;
var ghosts;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
    bg.fixedToCamera = true;

    map = game.add.tilemap('level1');
    map.addTilesetImage('tiles-1');
    map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);
    layer = map.createLayer('Tile Layer 1');
    // Un-comment this on to see the collision tiles
     //layer.debug = true;

    layer.resizeWorld();   
    
    // Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  The baddies!
    ghosts = game.add.group();
    ghosts.enableBody = true;
    ghosts.physicsBodyType = Phaser.Physics.ARCADE;
 
    createGhosts(); 
    
    //the cat
    player = game.add.sprite(32, 32, 'cat');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.bounce.y = 0.2;
    player.body.gravity.y = 250;
    player.body.collideWorldBounds = true;
    player.body.setSize(20, 32, 5, 16);

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();
    this.wasd = {
                up: game.input.keyboard.addKey(Phaser.Keyboard.W),
                down: game.input.keyboard.addKey(Phaser.Keyboard.S),
                left: game.input.keyboard.addKey(Phaser.Keyboard.A),
                right: game.input.keyboard.addKey(Phaser.Keyboard.D),
            };

}
////////////////////////////////////////////////////////////////////////////////
function createGhosts () { 

    var ghost = ghosts.create(20, 20, 'ghost');
    //game.physics.arcade.moveToObject(ghost, player, 120);

}
////////////////////////////////////////////////////////////////////////////////
function update() {

    game.physics.arcade.collide(player, layer);
    game.physics.arcade.collide(bullets, layer);

    player.body.velocity.x = 0;
    
    if(bullet.body.velocity.x == 0 && bullet.body.velocity.y == 0)
    {
    	    bullet.kill();
    }
   // ghosts.forEachAlive(moveGhost, this);

    if (game.input.activePointer.isDown)
    {
        fire();
    } 
        
    //moves and animates the player moving left
    if (this.wasd.left.isDown)
    {
        player.body.velocity.x = -150;

        if (facing != 'left')
        {
            player.animations.play('left');
            facing = 'left';
        }
    }
    
    //moves and animates the playermoving right
    else if (this.wasd.right.isDown)
    {
        player.body.velocity.x = 150;

        if (facing != 'right')
        {
            player.animations.play('right');
            facing = 'right';
        }
    }
    else
    {
    	//halts animation and stops movement when idle
        if (facing != 'idle')
        {
            player.animations.stop();

            if (facing == 'left')
            {
                player.frame = 0;
            }
            else
            {
                player.frame = 5;
            }

            facing = 'idle';
        }
    }
    
    //makes the sprite jump, but only if the player in touching the ground
    if (this.wasd.up.isDown && player.body.onFloor() && game.time.now > jumpTimer)
    {
        player.body.velocity.y = -250;
        jumpTimer = game.time.now + 750;
    }
    
    //collision handling
//    game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);

}
/*
function moveGhost (ghosts) { 
     accelerateToObject(ghosts,player,30);  //start accelerateToObject on every bullet
}

function accelerateToObject(obj1, obj2, speed) {
    if (typeof speed === 'undefined') { speed = 60; }
    var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
    obj1.body.rotation = angle + game.math.degToRad(90);  // correct angle of angry bullets (depends on the sprite used)
    obj1.body.force.x = Math.cos(angle) * speed;    // accelerateToObject 
    obj1.body.force.y = Math.sin(angle) * speed;
}*/

function fire() {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstDead();
        //where to spawn the bullet
        bullet.reset(player.x+24, player.y+32);

        game.physics.arcade.moveToPointer(bullet, 300);
    }

} 
function render () {

    // game.debug.text(game.time.physicsElapsed, 32, 32);
    // game.debug.body(player);
    // game.debug.bodyInfo(player, 16, 24);

}
/*
function collisionHandler (bullet, ghost) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    ghost.kill();

}*/

