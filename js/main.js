//creates the playing screen
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('level1', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'assets/tiles-1.png');
    game.load.spritesheet('cat', 'assets/cat.png', 32, 48);
    game.load.spritesheet('ghost', 'assets/ghost.png', 32, 32);
    game.load.image('background', 'assets/background2.jpg');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('portal', 'assets/Exit.png');
    game.load.audio('music', 'assets/Rainy Summer.mp3');

}

var map;
var tileset;
var layer;
var player;
var facing = 'right';
var jumpTimer = 0;
var cursors;
var bg;
var bullets;
var nextFire = 0;
var fireRate = 100;
var spawnTimer = 0;
var ghost;
var stateText;
var portal;
var music;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
    bg.fixedToCamera = true;

    map = game.add.tilemap('level1');
    map.addTilesetImage('tiles-1');
    map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);
    layer = map.createLayer('Tile Layer 1');
    //Un-comment this on to see the collision tiles
    //layer.debug = true;

    layer.resizeWorld();   
    
    //setting up the bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    
    music = game.add.audio('music');
    music.play();

    //the enemies the player must face
    ghosts = game.add.group();
    ghosts.enableBody = true;
    ghosts.physicsBodyType = Phaser.Physics.ARCADE;
    ghosts.createMultiple(30, 'ghost');
    ghosts.setAll('outOfBoundsKill', true);
    ghosts.setAll('checkWorldBounds', true);
    
    //the goal or portal
    portal = game.add.sprite(50,152, 'portal');
    game.physics.enable(portal, Phaser.Physics.ARCADE);
    
    //the cat
    player = game.add.sprite(40, 935, 'cat');
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
////////////////////////////////////////////////////////////////////////////////
function update() {

    game.physics.arcade.collide(player, layer);

    player.body.velocity.x = 0;

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
    
    if (game.time.now > spawnTimer)
    {
         ghost = ghosts.getFirstExists(false);
         ghost.reset(988, game.rnd.integerInRange(100,800), 'ghost');
         game.physics.arcade.moveToObject(ghost,player,120);
         //ghosts.forEachAlive(moveGhost, this);
         spawnTimer = game.time.now + 2000;
    }
    
    //makes the sprite jump, but only if the player in touching the ground
    if (this.wasd.up.isDown && player.body.onFloor() && game.time.now > jumpTimer)
    {
        player.body.velocity.y = -250;
        jumpTimer = game.time.now + 750;
    }
    
    //collision handling
    game.physics.arcade.overlap(bullets, ghosts, collisionHandler, null, this);
    game.physics.arcade.overlap(bullets, layer, killBullet, null, this);
    game.physics.arcade.overlap(player, portal, winning, null, this);
    game.physics.arcade.overlap(ghosts, player, catCaught, null, this);

}

function moveGhost (ghosts) { 
     accelerateToObject(ghosts,player,30);  //start accelerateToObject on every ghost
}

function accelerateToObject(obj1, obj2, speed) {
    if (typeof speed === 'undefined') { speed = 60; }
    var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
    obj1.body.rotation = angle + game.math.degToRad(90);  // correct angle of angry bullets (depends on the sprite used)
    obj1.body.force.x = Math.cos(angle) * speed;    // accelerateToObject 
    obj1.body.force.y = Math.sin(angle) * speed;
}

//enables the player to fire bullets towards the mouse's location
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
     //game.debug.bodyInfo(player, 16, 24);

}

//you lose
function catCaught (player, ghost)
{
	player.kill();
	ghosts.callAll('kill');

	        //Text
	stateText = game.add.text(player.x,player.y,' ', { font: '20px Arial', fill: '#fff' });
        stateText.anchor.setTo(0.5, 0.5);
	stateText.text=" You were Caught! \n Click to try again.";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
}
//you win
function winning (player, portal)
{
	player.kill();
	
	stateText = game.add.text(player.x+100,player.y,' ', { font: '20px Arial', fill: '#fff' });
        stateText.anchor.setTo(0.5, 0.5);
	stateText.text="You made it to the portal! \n Who is on the other side I wonder? \n To Be Continued. \n Click to play again!";
        stateText.visible = true;
}

//if a bullet hits the platforms, it's stopped
function killBullet (bullet, layer)
{
	bullet.kill();
}

//if a bullet hits a ghost, both die
function collisionHandler (bullet, ghost) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    ghost.kill();

}

function restart ()
{
	player.reset(40, 935);
	stateText.visible = false;
}

