"use strict";

export class Weapon{
    constructor(x, y, scene, name, iconSprite, projectileDamage, projectileSpeed, projectileGravity, projectileX, projectileY, projectileTexture, fireRate){
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
        this.fireRate = fireRate;
        this.nextFire = 0;

        // add group for projectiles
        this.projectiles = this.scene.physics.add.group();

        // add colider between projectiles and 
        this.scene.physics.add.collider(this.scene.player, this.projectiles, function (player, projectile) {
            console.log('hit');
            console.log(player.health);
            // only take damage if projectile is not from player.weapon.projectiles
            if (!player.weapon.projectiles.contains(projectile)){

                if (player.health > 0) {
                    player.takeDamage();
                    projectile.destroy();
                }
            }
        });
    }

    setShooterPosition(x, y){
        this.projectileX = x;
        this.projectileY = y;
    }

    fire(x,y){
        // check if weapon is on cooldown
        if(this.scene.time.now < this.nextFire){
            return;
        }
        // create new projectile and add to group and show on screen
        let projectile = new Projectile(this.scene, this.projectileX, this.projectileY, this.projectileTexture, this.projectileSpeed, this.projectileDamage, this.allowGravity);
        this.projectiles.add(projectile);

        // set gravity for projectile
        projectile.body.allowGravity = this.projectileGravity;
        projectile.travel(x, y);

        // set cooldown
        this.nextFire = this.scene.time.now + this.fireRate;

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

    travel(x, y){
        this.scene.physics.moveTo(this, x, y, this.speed);
    }
}

export default Weapon;