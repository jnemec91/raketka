"use strict";

export class Weapon{
    constructor(x, y, scene, name, iconSprite, projectileDamage, projectileSpeed, projectileGravity, projectileX, projectileY, projectileTexture){
        this.x = x;
        this.y = y;
        this.scene = scene;
        this.name = name;
        this.iconSprite = iconSprite;
        this.projectileDamage = projectileDamage;
        this.projectileSpeed = projectileSpeed;
        this.projectileGravity = projectileGravity;
        this.projectileX = projectileX;
        this.projectileY = projectileY;
        this.projectileTexture = projectileTexture;

        // add group for projectiles
        this.projectiles = this.scene.physics.add.group();

    }

    setShooterPosition(x, y){
        this.projectileX = x;
        this.projectileY = y;
    }

    fire(){
        // create new projectile and add to group and show on screen
        let projectile = new Projectile(this.scene, this.projectileX, this.projectileY, this.projectileTexture, this.projectileSpeed, this.projectileDamage, this.allowGravity);
        this.projectiles.add(projectile);

        // set gravity for projectile
        projectile.body.allowGravity = this.projectileGravity;
        projectile.travel();
        
        console.log("Firing projectile");
        console.log(this.projectiles.getChildren().length);
    }
}

export class Projectile extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture, speed, damage){
        super(scene, x, y, texture);
        this.speed = speed;
        this.damage = damage;

        // add to scene and enable physics
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);        
    }

    travel(){
        this.setVelocityY(this.speed);
    }


}

export default Weapon;