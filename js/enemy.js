export default class MovingEnemy {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
  }

  add() {
    this.sprite = scene.physics.add.sprite(this.x, this.y, 'enemy');
  }

  move() {
    this.x += this.speed;
    this.y += this.speed;
  }

}