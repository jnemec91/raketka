"use strict";

import Player from "./player.js";
import Enemy from "./enemy.js";
import WeaponCase from "./weaponCase.js";
import {Weapon, Projectile} from "./weapon.js";

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
var score = 0;
var scoreText;
var highScore = 0;
var highScoreText;

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
var enemies;
var enemyRoll;

var player;
var playerAngle = 0;
var playerProjectile;
var playerWeapon;
var lives;

var weaponCase;

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
    this.load.image('enemyTwo', 'assets/enemy_two.png');
    this.load.image('enemyThree', 'assets/enemy_three.png');
    
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

    this.load.image('pinkProjectile', 'assets/projectile_pink.png');
    this.load.image('greenProjectile', 'assets/projectile_green.png');
    this.load.image('greyProjectile', 'assets/projectile_grey.png');
    this.load.image('projectileRockets', 'assets/projectile_rockets.png');
    

    this.load.image('weaponBox', 'assets/box.png');
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

    // create a group for the enemies
    enemies = this.physics.add.group();


    // create player
    player = new Player(this, centerX, centerY, 'rocket', 0.2, -0.002, 5);
    this.player = player;
    
    playerWeapon = new Weapon(centerX, centerY, this, 'greyProjectile', 'greyProjectile', 0.5, 500, false, player.x, player.y, 'greyProjectile', 10);
    player.setWeapon(playerWeapon);



    cursors = this.input.keyboard.createCursorKeys();

    // create score text
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#FFF' });

    // create high score text
    highScoreText = this.add.text(16, 48, 'high score: 0', { fontSize: '32px', fill: '#FFF' });


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

    // add event listeners for planet
    planet.on('pointerdown', function () {
        gameStarted = true;
        planet.disableInteractive();
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

    // create group for lives
    lives = this.physics.add.group();

    // add rocket sprites to the lives
    for (let i=0; i < player.health; i++){
        let live = lives.create(gameWidth - 50 - 50*i, 50, 'rocket');
        live.setScale(0.1);
        live.setTint(0xFF0000);
        live.body.allowGravity = false;
        console.log(lives);
    }

    // create group for asteroids
    asteroids = this.physics.add.group();

    // add collider between player and asteroids
    this.physics.add.collider(player, asteroids, function (player, asteroid) {
        console.log('hit');
        console.log(player.health);
        if (player.health > 0) {
            player.takeDamage();
            asteroid.destroy();
        }
        else{
            gameRestart();
        }
    });

    // add collider between player and enemies
    this.physics.add.collider(player, enemies, function (player, enemy) {
        if (player.health > 0) {
            player.takeDamage();
            enemy.destroy();
        }
        else{
            gameRestart();
        }
    });

    // add collider between projectiles and asteroids
    this.physics.add.collider(playerWeapon.projectiles, asteroids, function (projectile, asteroid) {
        projectile.destroy();
        asteroid.destroy();
        score += 10;
        scoreText.setText('Score: ' + score);
    });
    
    // add collider between projectiles and enemies
    this.physics.add.collider(playerWeapon.projectiles, enemies, function (projectile, enemy) {
        enemy.health -= projectile.damage;
        if (enemy.health <= 0) {
            weaponCase = new WeaponCase(enemy.scene, enemy.x, enemy.y, 'weaponBox', enemy.weapon)
            weaponCase.allowGravity = true;
            enemy.destroy();
            score += 20;
            scoreText.setText('Score: ' + score);
        }
        projectile.destroy();
    });
    
    

    // delete the projectile if it leaves the screen
    // this.physics.world.on('worldbounds', function (body) {
    //     if (body.gameObject instanceof Projectile) {
    //         body.gameObject.destroy();
    //     }
    // });

    this.physics.world.on('worldbounds', function (body) {
        if (body.gameObject instanceof Phaser.Physics.Arcade.Sprite) {
            body.gameObject.destroy();
        }
    });

    function gameRestart() {
        player.speed = -0.001;
        player.anims.play('idleRocket', true);
        player.weapon.fireRate = 10;
        player.weapon.projectileTexture = 'greyProjectile';
        player.weapon.projectileDamage = 1;
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
        player.health = 5;

        planet.y = centerY;
        planet.x = centerX;
        planet.angle = 0;
        planet.setInteractive({ useHandCursor: true });

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

        // Reset the enemies
        enemies.clear(true, true);

        if (score > highScore) {
            highScore = score;
            highScoreText.setText('high score: ' + highScore);
        }

        score = 0;
        scoreText.setText('Score: ' + score);

        
        lives.children.iterate(function (child) {
            child.setVisible(true);
        });
    }

    // create animations for asteroids
    this.anims.create({
        key: 'asteroid',
        frames: this.anims.generateFrameNumbers('asteroid', { start: 0, end: 3 }),
        frameRate: 0.5,
        repeat: -1
    });

}

function update() {

    if (!gameStarted || !liftOff) {
        playerAngle += player.speed;
        player.rotation = playerAngle;

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
            moonTravelBack = true;
        }
        else if ((moon.x).toFixed(2) >= (centerX + moonOrbitRadius - 0.1).toFixed(2) && (moon.x).toFixed(2) <= (centerX + moonOrbitRadius + 0.1).toFixed(2)){
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

            enemies.children.iterate(function (child) {
                child.weapon.setShooterPosition(child.x, child.y);

                if (child.behavior == 'passive'){
                    // End y-coordinate is the height of the window
                    let endY = gameWidth;
                    // Calculate the vertical displacement (deltaY)
                    let deltaY = endY - child.y;
                    // Calculate the horizontal displacement (deltaX)
                    // Using tan(angle) = deltaY / deltaX => deltaX = deltaY / tan(angle)
                    let deltaX = deltaY / Math.tan(child.body.angle);
                    // Calculate the end x-coordinate
                    let endX = child.x + deltaX;                    
                    child.fireWeapon(endX, endY);

                }

                if (child.behavior == 'aggresive' && child.y < player.y - 200) {
                    child.fireWeapon(player.x, player.y);                    
                    child.moveToPlayer(player.x, player.y);
                }

            });

            lives.children.iterate(function (child) {
                var index = lives.children.entries.indexOf(child);
                if (index > player.health){
                    child.setVisible(false);
                }
            });
            
            enemyRoll = Phaser.Math.Between(0, 1000);
            
            // start creating asteroids
            if (enemyRoll > 970) {
                var asteroid = asteroids.create(Phaser.Math.Between(0, config.width), 0, 'asteroid');
                asteroid.setScale(0.1);
                asteroid.setVelocityY(Phaser.Math.Between(50, 100));
                asteroid.anims.play('asteroid', true);
            }

            // start creating new enemies
            if (enemyRoll <= 15 && enemyRoll > 5){
                let enemy = new Enemy(this, Phaser.Math.Between(0, config.width), 0, 'enemy', 0.1, 350, 0, 3, 'passive');
                let enemyWeapon = new Weapon(centerX, centerY, this, 'pinkProjectile', 'pinkProjectile', 1, 600, true, enemy.x, enemy.y, 'pinkProjectile', 1000);
                enemy.setWeapon(enemyWeapon);
                enemy.body.allowGravity = false;         
                
                enemies.add(enemy);
                enemy.moveDown(400);
            }
            
            else if (enemyRoll <= 5 && enemyRoll > 0) {
                let enemy = new Enemy(this, 0, 0, 'enemyThree', 0.1, 350, 0, 3, 'passive');
                let enemyWeapon = new Weapon(centerX, centerY, this, 'greenProjectile', 'greenProjectile', 2, 600, true, enemy.x, enemy.y, 'greenProjectile', 1000);
                enemy.setWeapon(enemyWeapon);
                enemy.body.allowGravity = false;

                enemies.add(enemy);
                enemy.moveToPlayer(player.x, player.y);
            }

            else if (enemyRoll == 0){
                let enemy = new Enemy(this, Phaser.Math.Between(0, config.width), 0, 'enemyTwo', 0.1, 350, 0, 5, 'aggresive');
                enemy.setScale(1.3);
                let enemyWeapon = new Weapon(centerX, centerY, this, 'projectileRockets', 'projectileRockets', 5, 300, true, enemy.x, enemy.y, 'projectileRockets', 2000);
                enemy.setWeapon(enemyWeapon);
                enemy.body.allowGravity = false;

                enemies.add(enemy);
                enemy.moveToPlayer(player.x, player.y);
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

            if (cursors.space.isDown) {
                player.weapon.setShooterPosition(player.x, player.y - 20);
                player.fireWeapon();
            }
        }
    }

    planet.angle += planetRotation;
    planet.setDepth(7);
}