Level = function (csvfile, characterStartX, characterStartY, goalX, goalY) {
	this.csvfile = csvfile;
	this.characterStartX = characterStartX;
	this.characterStartY = characterStartY;
	this.goalX = goalX;
	this.goalY = goalY;
	this.firstTimeRun = true;
};

Level.prototype = {

	preload: function() {
		this.load.image('background', 'assets/background.png');

		this.load.tilemap('map', this.csvfile, null, Phaser.Tilemap.CSV);
		this.load.image('tilemap', 'assets/platformblock.png');

		this.load.image('goal', 'assets/candy.png');

		this.bobby = new Character(this);
		bobby = this.bobby;
		this.bobby.preload(this.characterStartX, this.characterStartY);

		this.timer = new Timer(this);
		this.timer.preload();
	},

	create: function() {
		this.panoramaFinished = false;

		var map = game.add.tilemap('map', 40, 40);

		currentLevel = this.levelStateName;
		nextLevel = this.nextLevelStateName;

		map.addTilesetImage('tilemap');

		this.physics.startSystem(Phaser.Physics.Arcade);

		// Sets the size of the world depending on the size of the map
		this.add.tileSprite(0, 0, map.widthInPixels, map.heightInPixels, 'background');
		this.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

		this.layer = map.createLayer(0);

		// Objects can collide with the tile
		map.setCollisionBetween(0, 0);

		this.bobby.create(this.characterStartX, this.characterStartY);

		this.goal = this.add.sprite(this.goalX, this.goalY, 'goal');
		this.goal.anchor.setTo(0.5, 0.5);
		this.physics.arcade.enable(this.goal);
		this.physics.arcade.TILE_BIAS = 50;
		console.debug(game.time.fps);

		// Only pan the level the first time you run it.
		if(this.firstTimeRun) {
			// Pans the level beginning at the goal and ending at Bobby
			this.panorama = this.tweens.create(this.camera).from(
				{x: this.goal.x, y: this.goal.y}, 3000, Phaser.Easing.Quintic.InOut, true, 200);
			this.panorama.onComplete.add(this.panoramaCompleted, this);
			this.firstTimeRun = false;
		} else {
			this.panoramaCompleted();
		}

		this.timer.create();

		// Register hooks for the number keys to switch between levels.
		keynames = [ "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX",
		"SEVEN", "EIGHT", "NINE", "TEN", "ZERO" ];
		for ( var n = 1; n <= 10; n++){
			// The extra anonymous function here exists because of:
			switchLevel = ( function(n) { return function () { game.state.start(n); } } )(n);
			// Equivelant of this.input.keyboard.addKey(49,50, .. ,58)
			this.input.keyboard.addKey(Phaser.Keyboard[keynames[n]]).onDown.add(switchLevel);
		}
	},

	update: function() {
		if (this.panoramaFinished) {
			this.bobby.update();
			this.physics.arcade.overlap(this.bobby.torso, this.goal, this.goalReached);
		}
	},

	goalReached: function() {
		game.state.start('betweenLevels', true, false);
	},

	/**
	 * When the panorama view is completed bobbys update function starts running and the camera is set to follow bobby again.
	 */
	panoramaCompleted: function() {
		this.bobby.enableGravity();
		this.bobby.enableCheckWorldBounds();
		this.panoramaFinished = true;
		this.timer.started = true;
		this.camera.follow(this.bobby.torso);
	}

};
