import Phaser from 'phaser';

const GROUND_KEY = 'ground';
const DUDE_KEY = 'dude';

export default class MainScene extends Phaser.Scene {

    private platforms: Phaser.Physics.Arcade.StaticGroup;
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursor?: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super('MainScene');

        this.player = undefined;
        this.cursor = undefined;
    }

    preload() {
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image(GROUND_KEY, 'assets/platform.png');
        this.load.image('sky', 'assets/sky.png');
        this.load.image('star', 'assets/star.png');
        this.load.spritesheet(DUDE_KEY, 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        this.add.image(400, 300, 'sky');
        // this.add.image(400, 300, 'star')
        
        this.platforms = this.createPlatforms();
        this.player = this.createPlayer();

        this.physics.add.collider(this.player, this.platforms);

        this.cursor = this.input.keyboard!.createCursorKeys();
    }

    update() {

        if(!this.cursor) return;

        if(this.cursor.left?.isDown) {
            this.player?.setVelocityX(-160);
            this.player?.anims.play('left', true);
        }
        else if(this.cursor.right?.isDown) {
            this.player?.setVelocityX(160);
            this.player?.anims.play('right', true);
        }
        else {
            this.player?.setVelocityX(0);
            this.player?.anims.play('turn');
        }     
        
        if(this.cursor.up?.isDown && this.player?.body?.touching.down)
        {
            this.player?.setVelocityY(-330);
        }
    }

    private createPlatforms(): Phaser.Physics.Arcade.StaticGroup {
        const platforms = this.physics.add.staticGroup();
        const ground1: Phaser.Types.Physics.Arcade.SpriteWithStaticBody = 
            this.physics.add.staticSprite(400, 568, GROUND_KEY).setScale(2).refreshBody();
        platforms.add(ground1);

        platforms.create(600, 400, GROUND_KEY);
        platforms.create(50, 250, GROUND_KEY);
        platforms.create(750, 220, GROUND_KEY);

        return platforms;
    }

    private createPlayer(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
        const player = this.physics.add.sprite(100, 450, DUDE_KEY);
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 0, end: 3} ),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ {key: DUDE_KEY, frame: 4} ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 5, end: 8 } ),
            frameRate: 10,
            repeat: -1
        });

        return player;
    }
}