window.addEventListener("load", function() {
	var Q = window.Q = Quintus()
				.include("Scenes, Sprites, Input, UI, Touch, TMX, 2D, Anim, Audio")
				.setup({maximize: true})
				.controls()
				.touch()
				.enableSound();

	Q.Sprite.extend("Ninja",{

	  init: function(p) {

	    this._super(p, {
	      x: 350,
		  y: 350,
	      sprite: "ninja_anim",
	      sheet: "Idle__",
	      death: false,
	      attacking: false
	    });

	    this.add('2d, platformerControls, animation');


	    this.play("stand_right");

	    this.on("attacked", this, "finishAttack");
	  },

  	finishAttack: function() {
  		this.p.attacking = false;
  	},

	die: function(){
		this.p.death = true;
	},

	step: function(dt) {
		if(this.p.death == true) {	// Muerto.
			this.play("die");
			Q.stage().pause();
		}
		else{						// No muerto.
			if(Q.inputs['up']) {						// Saltos
				if(this.p.direction == "right") {
					console.log("salto derecha");
					this.p.sheet =  "Jump__";
					this.play("jump_right");
				}
				else {
					this.p.sheet =  "JumpL__";
					this.play("jump_left");
				}
			}

			if(this.p.vy > 0) {							// En el aire cayendo.
				if(this.p.flying) {
					if(this.p.direction == "right") {
						this.p.sheet =  "Glide_";
			      		this.play("glide_right");
					}
					else {
						this.p.sheet =  "GlideL_";
			      		this.play("glide_left");
					}
				}
				else {
					if(this.p.direction == "right") {
						this.p.sheet =  "Jump__";
						this.play("fall_right");
					}
					else {
						this.p.sheet =  "JumpL__";
						this.play("fall_left");
					}
				}
			}
			else if(this.p.vx > 0 && this.p.vy == 0) {					// Moviendo derecha.
				if(Q.inputs['attack'] || this.p.attacking) {
					this.p.sheet =  "Attack__";
			      	this.play("attack_right");
			      	this.p.attacking = true;
				}
				else if(this.p.sliding) {
					this.p.sheet =  "Slide__";
			      	this.play("slide_right");
				}
				else{
					this.p.sheet =  "Run__";
		      		this.play("run_right");
				}
		    } 
		    else if(this.p.vx < 0 && this.p.vy == 0) {					// Moviento izquierda.
		    	if(Q.inputs['attack'] || this.p.attacking) {
					this.p.sheet =  "AttackL__";
			      	this.play("attack_left");
			      	this.p.attacking = true;
				}
				else if(this.p.sliding) {
					this.p.sheet =  "SlideL__";
			      	this.play("slide_left");
				}
				else{
					this.p.sheet =  "RunL__";
		      		this.play("run_left");
				}
		    } 
		    else {										// Quieto.
				if(this.p.vy == 0) {
					if (this.p.direction == "left") {
						if(Q.inputs['attack'] || this.p.attacking) {
							this.p.sheet =  "AttackL__";
					      	this.play("attack_left");
					      	this.p.x += 304;
					      	this.p.attacking = true;
						}
						else {
							this.p.sheet =  "IdleL__";
							this.play("stand_left");
						}
					}
					else {
						if(Q.inputs['attack'] || this.p.attacking) {
							this.p.sheet =  "Attack__";
					      	this.play("attack_right");
					      	this.p.attacking = true;
						}
						else {
							this.p.sheet =  "Idle__";
							this.play("stand_right");
						}
					}
				}
		    }
		}
		
	}

	});
	//Animaciones Ninja
	Q.animations("ninja_anim", {
		attack_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false, trigger: "attacked" }, // Attack__
		attack_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false, trigger: "attacked" }, // AttackL__

		climb: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // Climb_

		glide_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // Glide_
		glide_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // GlideL_

		stand_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/5, loop: true }, // Idle__
		stand_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/5, loop: true }, // IdleL__

		jump_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Jump__
		jump_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // JumpL__

		fall_right: { frames: [9], rate: 1/10, loop: false }, // Jump__
		fall_left: { frames: [9], rate: 1/10, loop: false }, // JumpL__

		jumpAttack_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Jump_Attack__
		jumpAttack_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Jump_AttackL__

		run_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // Run__
		run_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // RunL__

		slide_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // Slide__
		slide_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // SlideL__

		throw_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Throw__
		throw_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // ThrowL__
		
		die_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Dead__
		die_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // DeadL__
	});
	
	
	
	//Animaciones Enemigo Ninja
	Q.animations("ninjaGirl_anim", {
		attack_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Attack__
		attack_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // AttackL__

		stand_right: { frames: [0,1,2], rate: 1/5, loop: true }, // Idle__
		stand_left: { frames: [0,1,2], rate: 1/5, loop: true }, // IdleL__

		jump_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Jump__
		jump_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // JumpL__

		run_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // Run__
		run_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // RunL__
		
		die_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Dead__
		die_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // DeadL__
	});

	Q.Sprite.extend("Fan", {
		init: function(p) {
			this._super(p, {
				sheet: "marioR",
				x: 240,
				y: 100
			});

			this.add('2d');
		}
	});

	// Escenario nivel 1.
	Q.scene("level1", function(stage) {
		Q.stageTMX("level.tmx", stage);

		var player = stage.insert(new Q.Ninja());
		//var fan = stage.insert(new Q.Fan());

//		stage.add("viewport").follow(player, {x: true, y: false});
		stage.add("viewport").follow(player);
		stage.viewport.scale = 1/3;
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

	Q.loadTMX("level.tmx, mario_small.png, mario_small.json, ninja.png, ninja.json", function() {
		Q.compileSheets("mario_small.png", "mario_small.json");
		Q.compileSheets("ninja.png", "ninja.json");
		Q.stageScene("level1", 0);
	});
});
