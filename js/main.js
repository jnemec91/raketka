"use strict";

import Player from "./player.js";
import Enemy from "./enemy.js";

var gameWidth = window.innerWidth - window.innerWidth * 0.03;
var gameHeight = window.innerHeight - window.innerHeight * 0.03;

var config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight,
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

var game = new Phaser.Game(config);
var cursors;
var score;
var scoreText;
var title;
var subtitle;
var gameStarted = false;
var liftOff = false;

var liftOffCounter = 3;
var planet;
var atmosphere;
var planetRotation = 0.1;
var stars;
var asteroids;

var player;
var playerAngle = 0;
var orbitRadius;
var turningAnimationPlayed = false;


var moon;
var moonOrbitRadius = 400;
var moonCenterOffset = 180;
var moonAngle = 0;
var moonTravelBack = false;
var moonScale = 0.1;    // Initial scale of the moon
var moonScaleChange = 0.0003; // best result with 0.0005
var moonSpeed = 0.008;  // best result with 0.01

// var speed = -0.002; // Speed of the movement
var linesGraphics;
var linesArray = [];
var countdownSprites = [];

var centerX = gameWidth / 2;
var centerY = gameHeight / 2;

function preload() {
    this.load.spritesheet('rocket', 'assets/rocket.png', { frameWidth: 272, frameHeight: 500 });
    this.load.spritesheet('asteroid', 'assets/asteroid1.png', { frameWidth: 525, frameHeight: 500 });

    this.load.image('enemy', 'assets/enemy.png');
    
    this.load.image('titleText', 'assets/raketka.png');
    this.load.image('subtitleText', 'assets/subtitle.png');

    this.load.image('number1', 'assets/number1.png');
    this.load.image('number2', 'assets/number2.png');
    this.load.image('number3', 'assets/number3.png');
    this.load.image('goSign', 'assets/gosign.png');

    this.load.image('moon', 'assets/moon.png');

    this.load.image('startButton', 'assets/planet.png');
    this.load.image('atmosphere', 'assets/atmosphere.png');
    this.load.image('star', 'assets/star.png');
}

function create() {
    // create coundown sprites and add them to array
    countdownSprites.push(this.add.sprite(centerX, centerY, 'goSign'));
    countdownSprites.push(this.add.sprite(centerX, centerY, 'number1'));
    countdownSprites.push(this.add.sprite(centerX, centerY, 'number2'));        
    countdownSprites.push(this.add.sprite(centerX, centerY, 'number3'));

    for (let i=0; i < countdownSprites.length; i++){
        // countdownSprites[i].visible = false;
        countdownSprites[i].setScale(0.2);
        countdownSprites[i].setDepth(11);
        countdownSprites[i].visible = false;
    }

    // Create a group for stars
    stars = this.physics.add.group();

    function createStars() {
        for (var i = 0; i < 20; i++) {
            var x = Phaser.Math.Between(0, config.width);
            var y = Phaser.Math.Between(0, config.height);
            var star = stars.create(x, y, 'star');
            
            star.setScale(0.5);
            star.body.allowGravity = false; // Initially, stars should not be affected by gravity
        }
    }
    
    // Create the stars
    createStars();

    // create player
    player = new Player(this, centerX, centerY, 'rocket', 0.2, -0.002, 3);

    cursors = this.input.keyboard.createCursorKeys();

    // create score text
    score = 0;
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#FFF' });

    // create title text
    title = this.add.sprite(centerX, centerY, 'titleText');
    title.setScale(0.55);
    title.setDepth(9);
    title.postFX.addGlow(0xFFFFFF, 0.5);

    // create subtitle text
    subtitle = this.add.sprite(centerX, centerY, 'subtitleText');
    subtitle.setScale(0.45);
    subtitle.setDepth(9);
    subtitle.postFX.addGlow(0xFFFFFF, 0.2);

    // create atmosphere
    atmosphere = this.add.sprite(centerX, centerY, 'atmosphere');
    atmosphere.setScale(1.1);
    atmosphere.alpha = 0.15;
    atmosphere.setDepth(6);

    // create moon
    moon = this.add.sprite(centerX, centerY, 'moon');
    moon.setScale(moonScale);
    moon.x = moonOrbitRadius;

    // create planet planet
    planet = this.add.sprite(centerX, centerY, 'startButton');
    planet.setScale(0.33);
    planet.setInteractive({ useHandCursor: true });

    

    // set the orbitRadius of the circle
    orbitRadius = planet.width * 0.25 / 2 + 100;

    planet.on('pointerdown', function () {
        gameStarted = true;

        player.anims.stop();
        player.anims.play('forward', true);

        countdownSprites[liftOffCounter].visible = true;
        liftOffCounter--;
    });

    planet.on('pointerover', function () {
        atmosphere.setScale(1.25);
        
        planet.setScale(0.37);
        planetRotation = 0.25;
    });

    planet.on('pointerout', function () {
        atmosphere.setScale(1.1);

        planet.setScale(0.33);
        planetRotation = 0.1;
    });

    // create group for asteroids
    asteroids = this.physics.add.group();

    // add collider between player and asteroids
    this.physics.add.collider(player, asteroids, function (player, asteroid) {
        console.log('hit');
        console.log(player.health);
        if (player.health > 0) {
            player.hurt();
            asteroid.destroy();
        }
        else{
            player.speed = -0.001;
            player.anims.play('idleRocket', true);

            gameStarted = false;
            liftOff = false;
            turningAnimationPlayed = false;

            liftOffCounter = 3;

            countdownSprites[0].y = centerY;

            for (let i=0; i < countdownSprites.length; i++){
                        countdownSprites[i].visible = false;
                    }

            player.x = centerX;
            player.y = centerY;
            player.setVelocity(0, 0);
            player.body.allowGravity = false;
            player.setOrigin(0.5, 0.5);
            player.health = 3;

            planet.y = centerY;
            planet.x = centerX;
            planet.angle = 0;

            atmosphere.y = centerY;
            atmosphere.x = centerX;

            moon.y = centerY

            asteroids.clear(true, true);

            title.visible = true;
            subtitle.visible = true;

            title.alpha = 1;
            subtitle.alpha = 1;

            // Reset the stars
            stars.clear(true, true);
            createStars();
                
        }
    });


    // create animations for asteroids
    this.anims.create({
        key: 'asteroid',
        frames: this.anims.generateFrameNumbers('asteroid', { start: 0, end: 3 }),
        frameRate: 2,
        repeat: -1
    });

}

function update() {
    if (!gameStarted || !liftOff) {
        playerAngle += player.speed;
        player.rotation = playerAngle;

        // console.log(player.getHealth());

        moonAngle += moonSpeed;
        moon.rotation = moonAngle / 3;
        
        if (moonTravelBack){
            moonCenterOffset += 1;
            moon.setDepth(8);
        }
        else{
            moonCenterOffset -= 1;
            moon.setDepth(5);
        }

        if (moon.x < centerX){
            moonScale = moonScale + moonScaleChange;
            moon.setScale(moonScale);
        }
        else {
            moonScale = moonScale - moonScaleChange;
            moon.setScale(moonScale);
        }
        

        player.x = centerX + orbitRadius * Math.cos(playerAngle);
        player.y = centerY + orbitRadius * Math.sin(playerAngle);

        moon.x = centerX + moonOrbitRadius * Math.cos(moonAngle);
        moon.y = centerY - moonCenterOffset * Math.sin(moonAngle);

        if ((moon.x).toFixed(2) >= (centerX - moonOrbitRadius - 0.1).toFixed(2) && (moon.x).toFixed(2) <= (centerX - moonOrbitRadius + 0.1).toFixed(2)){
            // console.log('min');
            moonTravelBack = true;
        }
        else if ((moon.x).toFixed(2) >= (centerX + moonOrbitRadius - 0.1).toFixed(2) && (moon.x).toFixed(2) <= (centerX + moonOrbitRadius + 0.1).toFixed(2)){
            // console.log('max');
            moonTravelBack = false;
        }

        if (!gameStarted) {
            player.anims.play('aroundPlanet', true);
        }
    }

    if (gameStarted) {
        player.speed = -0.04;

        if (parseInt(player.x) >= parseInt(centerX + orbitRadius) &&
            parseInt(player.x) <= parseInt(centerX + orbitRadius * 2) &&
            parseInt(player.y) >= parseInt(centerY - 20) &&
            parseInt(player.y) <= parseInt(centerY) &&
            liftOff == false) {

            if (liftOffCounter > 0) {

                title.alpha = 1 - (4 - liftOffCounter) * 0.25;
                subtitle.alpha = 1 - (4 - liftOffCounter) * 0.25;


                for (let i=0; i < countdownSprites.length; i++){
                    countdownSprites[i].visible = false;
                }
                countdownSprites[liftOffCounter].visible = true;


                liftOffCounter--;

            } else {
                title.visible = false;
                subtitle.visible = false;

                player.rotation = 0;
                liftOff = true;

                for (let i=0; i < countdownSprites.length; i++){
                    countdownSprites[i].visible = false;
                }

                countdownSprites[0].visible = true;                   
            }

        }

        if (liftOff) {
            planet.y += 10;
            countdownSprites[0].y += 10;
            atmosphere.y += 10;
            moon.y += 10;

            // Enable gravity for stars
            stars.children.iterate(function (child) {
                child.body.allowGravity = true;

                // If star leaves screen from bottom, reset it to the top at a random position
                if (child.y > config.height) {
                    child.y = 0;
                    child.setVelocityY(Phaser.Math.Between(50, 100));
                    child.x = Phaser.Math.Between(0, config.width);
                    child.body.allowGravity = false;
                }
            });

            // start creating asteroids
            if (Phaser.Math.Between(0, 100) > 97) {
                var asteroid = asteroids.create(Phaser.Math.Between(0, config.width), 0, 'asteroid');
                asteroid.setScale(0.1);
                asteroid.setVelocityY(Phaser.Math.Between(50, 100));
                asteroid.anims.play('asteroid', true);
            }

            // start creating enemies
            if (Phaser.Math.Between(0, 100) < 1) {
                let enemy = new Enemy(this, Phaser.Math.Between(0, config.width), 0, 'enemy', 0.1, 0.1, 0, 1);
                enemy.setScale(0.1);
                enemy.rotation = 3;
            }

            // controls for the player
            if (cursors.left.isDown) {
                player.setVelocityX(-450);
                if (!turningAnimationPlayed) {
                    player.anims.play('turnLeft', true);
                    turningAnimationPlayed = true;
                }
            } else if (cursors.right.isDown) {
                player.setVelocityX(450);
                if (!turningAnimationPlayed) {
                    player.anims.play('turnRight', true);
                    turningAnimationPlayed = true;
                }
            } else {
                player.setVelocityX(0);
                turningAnimationPlayed = false;
                player.anims.play('idleRocket', true);
            }

            if (cursors.up.isDown) {
                player.setVelocityY(-350);
                player.anims.play('forward', true);
            } else if (cursors.down.isDown) {
                player.setVelocityY(350);
            } else {
                player.setVelocityY(0);
                if (!turningAnimationPlayed) {
                    player.anims.play('idleRocket', true);
                }
            }
        }
    }

    planet.angle += planetRotation;
    planet.setDepth(7);
}