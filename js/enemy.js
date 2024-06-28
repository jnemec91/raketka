"use strict";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x,y, texture, scale, speed, angle, health){
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    
  }
}