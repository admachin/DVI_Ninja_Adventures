window.addEventListener("load", function() {
	var Q = window.Q = Quintus()
				.include("Scenes, Sprites, Input, UI, Touch, TMX, 2D, Anim, Audio")
				.setup({maximize: true})
				.controls()
				.touch();
				//.enableSound();


	Q.component("defaultEnemy", {
		extend: {
			colide: function(collision) {
				if(collision.obj.isA("Ninja")) {
					if(collision.obj.p.attacking == true || collision.obj.p.sliding == true){
						this.die();
					}
					else{
						this.attack();
						collision.obj.damage(this.p.attack);
					}
				}
			}
		}
	});

	Q.Sprite.extend("Ninja",{

		init: function(p) {
			this._super(p, {
			  x: 350,
			  y: 1850,
			  sprite: "ninja_anim",
			  sheet: "Idle__",
			  death: false,
			  attacking: false,
			  life: 500,
			  reloadTime: 0.5,
			  reload: 0.5
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

		damage: function(attack){
			if(this.p.reload < 0){
				this.p.reload = this.p.reloadTime;
				this.p.life -= attack;
				Q.state.inc("life", -attack);
				//console.log(this.p.life);
				if(this.p.life <= 0){
					this.die();
				}
			}
			
		},		
		step: function(dt) {
			this.p.reload-=dt;
			if(this.p.y > 3500) {
				this.die();
			}
			if(this.p.death == true) {	// Muerto.
				//this.play("die_" + this.p.direction);
				Q.stage().pause();
				Q.stageScene("loseGame", 1);
			}
			else{						// No muerto.
				if(Q.inputs['up']) {						// Saltos
					if(this.p.direction == "right") {
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

		fall_right: { frames: [9], loop: false }, // Jump__
		fall_left: { frames: [9], loop: false }, // JumpL__

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

	Q.Sprite.extend("EnemyGirl", {
		init: function(p) {
			this._super(p, {
				sprite: "enemy_anim",
				sheet: "EIdleL__",
				vx: -200,
				x: 2000,
				y: 1750,
				attacking: false, 
				attack: 100
			});

			this.add('2d, aiBounce, defaultEnemy, animation');

			this.on("EnemyAttacked", this, "finishAttack");

			this.on("bump.left, bump.right, bump.bottom", function(collision) {
				this.colide(collision);
			});
		},

		die: function() {
			//Q.audio.play("enemy_girl_die");
			this.destroy();
		},

		attack: function(){
			this.p.attacking = true;
			
		},

		finishAttack: function() {
			if (this.p.direction == "left"){
				this.p.vx = -200;

			}
			else{
				this.p.vx = 200;
			}
	  		this.p.attacking = false;
	  	},

		step: function(dt) {

			if(this.p.vx > 0 && this.p.vy == 0) {					// Moviendo derecha.

				if (this.p.attacking == true){
					this.p.vx = 0;
					this.p.sheet =  "EAttackL__";
	      			this.play("attack_left");
				}
				else{
					this.p.sheet =  "ERun__";
		      		this.play("run_right");
	      		}
					
		    } 
		    else if(this.p.vx < 0 && this.p.vy == 0) {					// Moviento izquierda.
		    	
		    	if (this.p.attacking == true){
		    		this.p.vx = 0;
					this.p.sheet =  "EAttack__";
	      			this.play("attack_right");
				}
				else{
					this.p.sheet =  "ERunL__";
		      		this.play("run_left");
	      		}

		    } 

		    

		}
	});

	//Animaciones Enemigo Ninja
	Q.animations("enemy_anim", {
		attack_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false, trigger: "EnemyAttacked"  }, // EAttack__
		attack_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false, trigger: "EnemyAttacked"  }, // EAttackL__

		stand_right: { frames: [0,1,2], rate: 1/5, loop: true }, // EIdle__
		stand_left: { frames: [0,1,2], rate: 1/5, loop: true }, // EIdleL__

		jump_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // EJump__
		jump_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // EJumpL__
		
		fall_right: { frames: [9], rate: 1/10, loop: false }, // EJump__
		fall_left: { frames: [9], rate: 1/10, loop: false }, // EJumpL__

		run_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // ERun__
		run_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // ERunL__
		
		die_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // EDead__
		die_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // EDeadL__
	});

	Q.Sprite.extend("Fin", {
		init: function(p) {
			this._super(p, {
				asset: "coin",				
				sheet: "coin",
				x: 25200,
				y: 548,
				sensor: true
			});
			
			this.on("sensor");
		},

		sensor: function() {
			//Q.audio.stop("music_main");
			//Q.audio.play("music_level_complete");
			Q.stageScene("winGame", 1);		
			Q.stage().pause();
		}
	});

	Q.Sprite.extend("Acid", {
		init: function(p) {
			this._super(p, {
				asset: "acido",				
				sheet: "acido",
				sensor: true
			});
			
			this.on("sensor");
		},

		sensor: function() {
			//Q.audio.stop("music_main");
			//Q.audio.play("music_level_complete");
			Q.stageScene("loseGame", 1);		
			Q.stage().pause();
		}
	});

	//Animaciones Enemigo Ninja
	Q.animations("acid_anim", {
		acido: { frames: [1]}
	});

	// Escenario nivel 1.
	Q.scene("level1", function(stage) {
		Q.stageTMX("level.tmx", stage);

		var player = stage.insert(new Q.Ninja());
		var enemy = stage.insert(new Q.EnemyGirl());
		stage.insert(new Q.Fin());

		Q.state.reset({life: player.p.life});
		Q.stageScene("HUD", 1);
		//stage.add("viewport").follow(player, {x: true, y: false});
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
			color: "red",
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
			color: "green",
			label: "Win Nakamura"
		}));

		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level1');
		});

		container.fit(20);
	});

	// Escenario para el HUD.
	Q.scene("HUD", function(stage) {
		var label = stage.insert(new Q.UI.Text({
			x: 100,
			y: 35,
			label: "Vida: 500",
			color: "yellow"
		}));
		
		Q.state.on("change.life", this, function() {
			var coinstr = "Vida: " + Q.state.p.life;
			label.p.label =  coinstr;
		});
	});

	//Q.loadTMX("level.tmx, mario_small.png, mario_small.json, ninja.png, ninja.json, coin.png, coin.json, EnemyNinja.png, EnemyNinja.json, acido.png, acido.json, enemy_girl_die.mp3", function() {
	Q.loadTMX("level.tmx, mario_small.png, mario_small.json, ninja.png, ninja.json, coin.png, coin.json, EnemyNinja1.png, EnemyNinja1.json, EnemyNinja2.png, EnemyNinja2.json, acido.png, acido.json", function() {
		Q.compileSheets("mario_small.png", "mario_small.json");
		Q.compileSheets("ninja.png", "ninja.json");
		Q.compileSheets("coin.png", "coin.json");
		Q.compileSheets("acido.png", "acido.json");
		Q.compileSheets("EnemyNinja1.png", "EnemyNinja1.json");
		Q.compileSheets("EnemyNinja2.png", "EnemyNinja2.json");
		/*Q.load({
			"enemy_girl_die": "enemy_girl_die.mp3"
		}),*/
		Q.stageScene("level1", 0);
	});
});
