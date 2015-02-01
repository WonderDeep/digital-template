//window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    "use strict";
    
    //game(width, height, format, name, {preload: functions})
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

//  Tilemaps are split into two parts: The actual map data (usually stored in a CSV or JSON file) 
    //  and the tileset/s used to render the map.

    //  Here we'll load the tilemap data. The first parameter is a unique key for the map data.

    //  The second is a URL to the JSON file the map data is stored in. This is actually optional, you can pass the JSON object as the 3rd
    //  parameter if you already have it loaded (maybe via a 3rd party source or pre-generated). In which case pass 'null' as the URL and
    //  the JSON object as the 3rd parameter.

    //  The final one tells Phaser the foramt of the map data, in this case it's a JSON file exported from the Tiled map editor.
    //  This could be Phaser.Tilemap.CSV too.
    game.load.tilemap('level1', 'assets/games/starstruck/level1.json', null, Phaser.Tilemap.TILED_JSON);
    //  Next we load the tileset. This is just an image, loaded in via the normal way we load images:
    // these tiles were made using the original tiles-1 from starstruck as base
    game.load.image('tiles-1', 'assets/tiles-1.png');
    
    //cat sprite made using "dude" from starstruck as a base
    //each frame in the sprite sheet is 32x48 with 9 frames total
    //you can put 9 after 48 incase there are more than 9 frames but 
    //	you only want 9 to be read.
    game.load.spritesheet('cat', 'assets/cat.png', 32, 48);

    //background mading using the background from starstruckas base
    game.load.image('background', 'assets/background.png');
    game.load.audio('boden', ['assets/audio/bodenstaendig_2000_in_rock_4bit.mp3', 'assets/audio/bodenstaendig_2000_in_rock_4bit.ogg']);
    game.load.spritesheet('droid', 'assets/games/starstruck/droid.png', 32, 32);
    game.load.image('starSmall', 'assets/games/starstruck/star.png');
    game.load.image('starBig', 'assets/games/starstruck/star2.png');
    game.load.image('bullet', 'assets/games/invaders/bullet.png');
    
}

var map;
var tileset;
var layer;
var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var bg;
var music;
var bullets;

function create() {
	
    //imports the game physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //sets the background color (behind the bg image)
    game.stage.backgroundColor = '#000000';
    
    
        //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    

    //tiles in the background image and makes it static
    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
    bg.fixedToCamera = true;

    //imports and play the gamemusic
    music = game.add.audio('boden');
    music.play();
    
    //sets up the platformmap for the player to navigate
    map = game.add.tilemap('level1');
    map.addTilesetImage('tiles-1');
    map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);

    layer = map.createLayer('Tile Layer 1');

    //  Un-comment this on to see the collision tiles
    // layer.debug = true;

    //reproportions things so that they all fit within the map
    layer.resizeWorld();

    //gravity is imported
    game.physics.arcade.gravity.y = 250;

    //imports the player's sprite
    player = game.add.sprite(32, 32, 'cat');
    //tells the physics to effect the player
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;
    player.body.setSize(20, 32, 5, 16);

    //sets up an animation
    // (title, frame(s), frames per second (speed), loop=true)
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //tells thecamera to follow the player
    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

function update() {

    game.physics.arcade.collide(player, layer);

    player.body.velocity.x = 0;

     //  Firing?
     if (fireButton.isDown)
     {
          fireBullet();
     }
        
    //moves and animates the player moving left
    if (cursors.left.isDown)
    {
        player.body.velocity.x = -150;

        if (facing != 'left')
        {
            player.animations.play('left');
            facing = 'left';
        }
    }
    
    //moves and animates the playermoving right
    else if (cursors.right.isDown)
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
    if (cursors.up.isDown && player.body.onFloor() && game.time.now > jumpTimer)
    {
        player.body.velocity.y = -250;
        jumpTimer = game.time.now + 750;
    }

}

function render () {

    // game.debug.text(game.time.physicsElapsed, 32, 32);
    // game.debug.body(player);
    // game.debug.bodyInfo(player, 16, 24);
    //game.debug.soundInfo(music, 20, 32);

}    
//    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
//    function preload() {
        // Load an image and call it 'logo'.
//        game.load.image( 'logo', 'assets/phaser.png' );
//    }
    
//    var bouncy;
    
//    function create() {
        // Create a sprite at the center of the screen using the 'logo' image.
//        bouncy = game.add.sprite( game.world.centerX, game.world.centerY, 'logo' );
        // Anchor the sprite at its center, as opposed to its top-left corner.
        // so it will be truly centered.
//        bouncy.anchor.setTo( 0.5, 0.5 );
        
        // Turn on the arcade physics engine for this sprite.
//        game.physics.enable( bouncy, Phaser.Physics.ARCADE );
        // Make it bounce off of the world bounds.
//        bouncy.body.collideWorldBounds = true;
        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
//        var style = { font: "25px Verdana", fill: "#9999ff", align: "center" };
//        var text = game.add.text( game.world.centerX, 15, "Build something awesome.", style );
//        text.anchor.setTo( 0.5, 0.0 );
//    }
    
//    function update() {
        // Accelerate the 'logo' sprite towards the cursor,
        // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
        // in X or Y.
        // This function returns the rotation angle that makes it visually match its
        // new trajectory.
//        bouncy.rotation = game.physics.arcade.accelerateToPointer( bouncy, this.game.input.activePointer, 500, 500, 500 );
//    }
//};
