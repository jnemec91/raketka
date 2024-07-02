"use strict";

export default class WeaponCase extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, weapon) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.weapon = weapon;

        this.scene.physics.add.collider(this.scene.player, this, (player, weaponCase) => {
            player.weapon.projectileTexture = this.weapon.projectileTexture;
            player.weapon.projectileDamage = this.weapon.projectileDamage;
            if (this.weapon.projectileDamage > 4){
                player.weapon.fireRate = 200;
            }
            else{
                player.weapon.fireRate = 50;
            }
            this.destroy();
        });
    }
}
