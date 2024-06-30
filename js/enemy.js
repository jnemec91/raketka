"use strict";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x,y, texture, scale, speed, angle, health, behavior){
    super(scene, x, y, texture);

    this.angle = angle;
    this.speed = speed;
    this.health = health;
    this.weapon = null;
    this.behavior = behavior;
    this.returning = false;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    
  }

  move(playerX, playerY){
    // change angle of enemy to face player, then move towards player
    let playerAngle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY);

    // todo: fix rotation so enemy ship always faces player
    this.setRotation(playerAngle+3+Math.PI/2);
    
    // show if enemy is facing player
    // console.log("player angle: ", playerAngle, "enemy angle: ", this.angle-3 + Math.PI*2);

    this.scene.physics.moveTo(this, playerX, playerY, this.speed);
    console.log("moving towards ", playerX, playerY);
  }

  takeDamage(damage){
    this.health -= damage;
  }

  setWeapon(weapon){
      this.weapon = weapon;
  }

  fireWeapon(playerX, playerY){
    if (this.y < playerY - 200){
      this.weapon.fire(playerX, playerY);
    }
    
}  
}