window.addEventListener("load", function() {
	var Q = window.Q = Quintus()
				.include("Scenes, Sprites, Input, UI, Touch, TMX, 2D, Anim, Audio")
				.setup({maximize: true})
				.controls()
				.touch()
				.enableSound();

	Q.Sprite.extend("Player", {
		init: function(p) {
			this._super(p, {
				sheet: "marioR",
				x: 100,
				y: 100
			});

			this.add('2d, platformerControls');
		}
	});

	Q.Sprite.extend("Fan", {
		init: function(p) {
			this._super(p, {
				sheet: "marioR",
				x: 240,
				y: 100
			});

			this.add('2d');

			this.on('bump.left-remote', function(collision) {
				console.log("remote collision");
			});
		}
	});

	// Escenario nivel 1.
	Q.scene("level1", function(stage) {
		Q.stageTMX("level.tmx", stage);

		var player = stage.insert(new Q.Player());
		var fan = stage.insert(new Q.Fan());
		fan.follow(player);

		stage.add("viewport").follow(player);
	});

	// Escenario Partida perdida.
	Q.scene("loseGame", function(stage) {
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2,
			y: Q.height/2,
			fill: "rgba(0,0,0,0.5)"
		}));
		var button = container.insert(new Q.UI.Button({
			x: 0,
			y: 0,
			fill: "#CCCCCC",
            label: "Play Again"
        }));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -15 - button.p.h,
			label: "Game Over"
		}));

		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level1');
		});

		container.fit(20);
	});

	// Escenario de Victoria.
	Q.scene("winGame", function(stage) {
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2,
			y: Q.height/2,
			fill: "rgba(0,0,0,0.5)"
		}));
		var button = container.insert(new Q.UI.Button({
			x: 0,
			y: 0,
			fill: "#CCCCCC",
            label: "Play Again"
        }));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -15 - button.p.h,
			label: "Win Mario"
		}));

		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level1');
		});

		container.fit(20);
	});

	Q.loadTMX("level.tmx, mario_small.png, mario_small.json", function() {
		Q.compileSheets("mario_small.png", "mario_small.json");
		Q.stageScene("level1", 0);
	});
});