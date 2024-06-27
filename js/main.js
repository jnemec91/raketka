"use strict";

import MovingEnemy from "./enemy.js";

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
var turningAnimationPlayed = false;
var liftOffCounter = 3;
var button;
var atmosphere;
var buttonRotation = 0.1;
var player;
var stars;
var angle = 0;
var orbitRadius;
var asteroids;
var moon;
var moonOrbitRadiusMin;
var moonOrbitRadiusMax;
var moonTravelBack = false;
var centerX = gameWidth / 2;
var centerY = gameHeight / 2;
var speed = -0.002; // Speed of the movement
var linesGraphics;
var linesArray = [];
var countdownSprites = [];

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
    player = this.physics.add.sprite(centerX, centerY, 'rocket');
    player.setVelocity(0, 0);
    player.body.allowGravity = false;
    player.setScale(0.2);
    player.setCollideWorldBounds(true);
    player.setDepth(10);

    cursors = this.input.keyboard.createCursorKeys();

    // create score text
    score = 0;
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#FFF' });

    // create title text
    title = this.add.sprite(centerX, centerY, 'titleText');
    title.setScale(0.55);
    title.setDepth(9);

    // create subtitle text
    subtitle = this.add.sprite(centerX, centerY, 'subtitleText');
    subtitle.setScale(0.45);
    subtitle.setDepth(9);

    // create atmosphere
    atmosphere = this.add.sprite(centerX, centerY, 'atmosphere');
    atmosphere.setScale(1.1);
    atmosphere.alpha = 0.15;
    atmosphere.setDepth(6);

    // create moon
    moon = this.add.sprite(centerX, centerY, 'moon');
    moon.setScale(0.1);

    moonOrbitRadiusMin = centerX - 300;
    moonOrbitRadiusMax = centerX + 300;
    moon.x = moonOrbitRadiusMin

    // create planet button
    button = this.add.sprite(centerX, centerY, 'startButton');
    button.setScale(0.33);
    button.setInteractive({ useHandCursor: true });
    title.setDepth(7);

    // set the orbitRadius of the circle
    orbitRadius = button.width * 0.25 / 2 + 100;

    button.on('pointerdown', function () {
        gameStarted = true;

        let anim = player.anims.get('aroundPlanet');
        if (anim) {
            anim.stop();
        }

        player.anims.play('forward', true);

        countdownSprites[liftOffCounter].visible = true;
        liftOffCounter--;
    });

    button.on('pointerover', function () {
        atmosphere.setScale(1.25);

        button.setScale(0.37);
        buttonRotation = 0.25;
    });

    button.on('pointerout', function () {
        atmosphere.setScale(1.1);

        button.setScale(0.33);
        buttonRotation = 0.1;
    });

    // create group for asteroids
    asteroids = this.physics.add.group();

    // add collider between player and asteroids
    this.physics.add.collider(player, asteroids, function (player, asteroid) {
        speed = -0.001;
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

        button.y = centerY;
        button.x = centerX;
        button.angle = 0;

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

    });

    // create animations for player

    this.anims.create({
        key: 'turnRight',
        frames: this.anims.generateFrameNumbers('rocket', { start: 1, end: 2 }),
        frameRate: 10,
    });

    this.anims.create({
        key: 'turnLeft',
        frames: this.anims.generateFrameNumbers('rocket', { start: 3, end: 4 }),
        frameRate: 10,
    });

    this.anims.create({
        key: 'forward',
        frames: [{ key: 'rocket', frame: 5 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'idleRocket',
        frames: [{ key: 'rocket', frame: 6 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'aroundPlanet',
        frames: this.anims.generateFrameNumbers('rocket', { start: 6, end: 11 }),
        frameRate: 1,
    });

    // create animations for asteroids

    this.anims.create({
        key: 'asteroid',
        frames: this.anims.generateFrameNumbers('asteroid', { start: 0, end: 3 }),
        frameRate: 2,
        repeat: -1
    });

    // Create a graphics object for drawing lines
    linesGraphics = this.add.graphics();
}

function update() {
    if (!gameStarted || !liftOff) {
        angle += speed;
        player.rotation = angle;

        player.x = centerX + orbitRadius * Math.cos(angle);
        player.y = centerY + orbitRadius * Math.sin(angle);

        if (!moonTravelBack){
            moon.x = moon.x + 3;
            if (moon.x >= moonOrbitRadiusMax){
                moonTravelBack = true;
                moon.setDepth(8);
                
            }
        } else {
            moon.x = moon.x - 3;
            if (moon.x <= moonOrbitRadiusMin){
                moonTravelBack = false;
                moon.setDepth(6);
            }
        }

        if (!gameStarted) {
            player.anims.play('aroundPlanet', true);
        }
    }

    if (gameStarted) {
        speed = -0.04;

        if (parseInt(player.x) >= parseInt(centerX + orbitRadius) &&
            parseInt(player.x) <= parseInt(centerX + orbitRadius * 2) &&
            parseInt(player.y) >= parseInt(centerY - 8) &&
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
            button.y += 10;
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

            // // Add lines behind the rocket
            // var tailLength = 300; // Length in pixels to keep the tail
            // var lineSpacing = 10; // Space between the lines

            // if (linesArray.length === 0) {
            //     for (var i = 0; i < 3; i++) {
            //         linesArray.push({ x: player.x, y: player.y });
            //     }
            // } else {
            //     linesArray.push({ x: player.x, y: window.innerHeight-player.y +300 });
            //     if (linesArray.length > tailLength / lineSpacing) {
            //         linesArray.shift();
            //     }
            // }

            // // Draw lines
            // linesGraphics.clear();
            // linesGraphics.lineStyle(2, 0xffffff, 1);
            // for (var i = 0; i < linesArray.length; i++) {
            //     var point = linesArray[i];
            //     var alpha = 1 - (i / linesArray.length);
            //     linesGraphics.lineStyle(2, 0xffffff, alpha);
            //     linesGraphics.beginPath();
            //     linesGraphics.moveTo(player.x, player.y);
            //     linesGraphics.lineTo(point.x, point.y);
            //     linesGraphics.strokePath();
            // }
        }
    }

    button.angle += buttonRotation;
    button.setDepth(7);
}