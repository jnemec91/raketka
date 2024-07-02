"use strict";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, scale, speed, health) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(scale);
        this.setVelocity(0, 0);
        this.setDepth(10);
        this.setCollideWorldBounds(true);
        this.body.allowGravity = false;
        this.createAnimations(scene);
        this.health = health;
        this.speed = speed;
        this.weapon = null;
        this.turningAnimationPlayed = false;
    }

    createAnimations(scene) {
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
    }

    takeDamage(){
        this.health -= 1;
        console.log("Player health: " + this.health);
    }

    setWeapon(weapon){
        this.weapon = weapon;
    }

    fireWeapon(){
        this.weapon.fire(this.x-this.body.velocity.x / 100, 0);
    }

}
