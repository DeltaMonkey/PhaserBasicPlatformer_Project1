import Phaser from 'phaser';
import ScoreLabel from '../ui/ScoreLabel';
import BombSpawner from '../helpers/BombSpawner';

const GROUND_KEY = 'ground';
const DUDE_KEY = 'dude';
const STAR_KEY = 'star';
const BOMB_KEY = 'bomb';

export default class MainScene extends Phaser.Scene {

    private player?: Phaser.Physics.Arcade.Sprite;
    private cursor?: Phaser.Types.Input.Keyboard.CursorKeys;
    private scoreLabel?: ScoreLabel;
    private stars?: Phaser.Physics.Arcade.Group;
    private bombSpawner?: BombSpawner;

    private gameOver: boolean;

    constructor() {
        super('MainScene');

        this.player = undefined;
        this.cursor = undefined;
        this.scoreLabel = undefined;
        this.bombSpawner = undefined;

        this.gameOver = false;
    }

    public preload(): void {
        this.load.image(BOMB_KEY, 'assets/bomb.png');
        this.load.image(GROUND_KEY, 'assets/platform.png');
        this.load.image('sky', 'assets/sky.png');
        this.load.image(STAR_KEY, 'assets/star.png');
        this.load.spritesheet(DUDE_KEY, 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    public create(): void {
        this.add.image(400, 300, 'sky');
        // this.add.image(400, 300, 'star')
        
        const platforms : Phaser.Physics.Arcade.StaticGroup = this.createPlatforms();
        this.player = this.createPlayer();
        this.stars = this.createStars();

        this.scoreLabel = this.createScoreLabel(16, 16, 0);

        this.bombSpawner = new BombSpawner(this, BOMB_KEY);
        const bombGroup = this.bombSpawner.group;

        this.physics.add.collider(this.player, platforms);
        this.physics.add.collider(this.stars, platforms);
        this.physics.add.collider(bombGroup, platforms);
        this.physics.add.collider(this.player, bombGroup, this.hitBomb, undefined, this);

        this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);

        this.cursor = this.input.keyboard!.createCursorKeys();
    }

    public update(): void {

        if (this.gameOver) return;

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

    private createStars(): Phaser.Physics.Arcade.Group {
        const stars: Phaser.Physics.Arcade.Group = this.physics.add.group({
            key: STAR_KEY,
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        stars.children.iterate((child) => {
			const childBody = child.body as Phaser.Physics.Arcade.Body;
            childBody.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            return true;
		});

        return stars;
    }

    private collectStar(
        player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, 
        star: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
    ): void {
        (star as Phaser.Physics.Arcade.Sprite).disableBody(true, true);

        this.scoreLabel?.add(10);

        if (this.stars?.countActive(true) === 0) {
            // A new batch of stars to collectü
            this.stars.children.iterate((child) => {
                const childSprite = child as Phaser.Physics.Arcade.Sprite;
                childSprite.enableBody(true, childSprite.x, 0, true, true);
                return true;
            })
        }

        this.bombSpawner?.spawn(this.player!.x);

    }

    private createScoreLabel(x: number, y: number, score: number): ScoreLabel {
        const style = { fontSize: '32px', fill: '#000' };
        const label = new ScoreLabel(this, x, y, score, style);

        this.add.existing(label);

        return label;
    }

    private hitBomb(
        player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, 
        bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile 
    ): void {
            this.physics.pause();
            const playerSprite = (player as Phaser.Physics.Arcade.Sprite);
            playerSprite.setTint(0xff0000);
            playerSprite.anims.play('turn');
            this.gameOver = true;
    }
}