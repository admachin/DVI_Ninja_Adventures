	window.addEventListener("load", function() {
	var Q = window.Q = Quintus({ development: true })
				.include("Scenes, Sprites, Input, UI, Touch, TMX, 2D, Anim, Audio")
				.setup({
					width:  480,
					height: 480
				})
				.controls()
				.touch()
				.enableSound();
	//defaultEnemy
	Q.component("defaultEnemy", {
		added: function() {
			this.entity.on("bump.left", this, "Left");
			this.entity.on("bump.right", this, "Right");
			this.entity.on("bump.bottom, bump.top", this, "colisiones");
		},


		Left: function(collision) {
			if(collision.obj.isA("Ninja")) {
				this.entity.p.direction = "left";
				if(collision.obj.p.attacking == true || collision.obj.p.sliding == true)
					this.entity.damage(collision.obj.p.attack);
				else {
					this.entity.attack();
					this.entity.p.direction_right = false;
					collision.obj.damage(this.entity.p.attack);
				}
			}
		
		},

		Right: function(collision) {
			this.entity.p.direction = "right";
			if(collision.obj.isA("Ninja")) {
				if(collision.obj.p.attacking == true || collision.obj.p.sliding == true)
					this.entity.damage(collision.obj.p.attack);
				else {
					this.entity.attack();
					this.entity.p.direction_right = true;
					collision.obj.damage(this.entity.p.attack);
				}
			}
		
		},

		colisiones: function(collision) {
			if(collision.obj.isA("Ninja")) {
					if(collision.obj.p.attacking == true || collision.obj.p.sliding == true)
						this.entity.die();
					else {
						this.entity.attack();
						collision.obj.damage(this.entity.p.attack);
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
			  sheet: "ninjaL",
			  death: false,
			  attacking: false,
			  attack: 200,
			  life: 500,
			  reloadTime: 0.5,
			  reload: 0.5
			});

			this.add('2d, platformerControls, animation');

			this.play("stand_right");

			this.on("attacked", this, "finishAttack");

			this.on("playerDie", this, "finish");

			this.on("hit", this, "collision");
		},

		collision: function(col) {
			if(col.obj.isA("Wind")) {	// Set the collision with the wind to be able to go inside it.
				this.p.x += col.separate[0];
				this.p.y += col.separate[1];
				if(Q.inputs['fire']) {
					this.play("glide_" + this.p.direction, 1);
					this.p.vy = -300;
				}
			}
		},

	  	finishAttack: function() {
	  		this.p.attacking = false;
	  	},

		die: function(){
			this.p.death = true;
		},

		finish: function() {
			Q.stage().pause();
			Q.stageScene("loseGame", 1);
		},

		damage: function(attack){
			if(this.p.reload < 0){
				this.p.reload = this.p.reloadTime;
				this.p.life -= attack;
				Q.state.inc("life", -attack);
				if(this.p.life <= 0){
					this.die();
				}
			}	
		},	

		step: function(dt) {
			this.p.reload-=dt;
			if(this.p.y > 3500)
				this.die();
			if(this.p.death)		// Muerto.
				this.play("die_" + this.p.direction, 1);
			else {					// No muerto.
				if(Q.inputs['up'])							// Saltos.
					this.play("jump_" + this.p.direction, 1);
				if(this.p.vy != 0) {							// En el aire cayendo.
					if(this.p.flying)
						this.play("glide_" + this.p.direction);
					else {
						if(Q.inputs['attack'] || this.p.attacking)
							this.play("attack_jump_" + this.p.direction, 1);
						else
							this.play("fall_" + this.p.direction);
					}
				}
				else if(this.p.vx != 0 && this.p.vy == 0) {	// Moviendose sin caer.
						if(Q.inputs['attack'] || this.p.attacking) {
							this.play("attack_" + this.p.direction);
							Q.audio.play("sword_attack", {debounce: 500});
							this.p.attacking = true;
						}
						else if(this.p.sliding)
							this.play("slide_" + this.p.direction);
						else
							this.play("run_" + this.p.direction);
				}
				else {										// Quieto.
					if(Q.inputs['attack'] || this.p.attacking) {
						this.play("attack_" + this.p.direction);
						Q.audio.play("sword_attack", {debounce: 500});
					}
					else
						this.play("stand_" + this.p.direction);
				}
			}
		}
	});

	Q.Sprite.extend("Fan", {	// Sprite to represent the fan foot.
		init: function(p) {
			this._super(p, {
				sheet: "fan",
				sprite: "fan_anim",
				x: 240,
				y: 1828
			});
			this.add("animation");

			this.play("fan_animation");
		}
	});
	
	Q.Sprite.extend("Wind", {	// Sprite with no sheet to make ninja fly when he goes into it.
		init: function(p) {
			this._super(p, {
				sheet: "wind",
				sprite: "wind_anim"
			});
			this.add("animation");

			this.play("wind_animation");
		}
	});

	//Enemigo Ninja
	Q.Sprite.extend("EnemyNinja", {
		init: function(p) {
			this._super(p, {
				sheet: "enemy_ninjaL",
				sprite: "enemy_ninja_anim",
				vx: -200,
				x: 0,
				y: 0,
				attacking: false, 
				attack: 100,
				direction: "left",
				life: 400,
				reloadTime: 0.5,
				reload: 0.5
			});

			this.add('2d, aiBounce, defaultEnemy, animation');

			this.on("EnemyAttacked", this, "finishAttack");
			this.on("EnemyDie", this, "delete");
		},

		damage: function(attack){
			if(this.p.reload < 0){
				this.p.reload = this.p.reloadTime;
				this.p.life -= attack;
				if(this.p.life <= 0){
					this.die();
				}
			}	
		},

		die: function() {
			this.play("die_" + this.p.direction, 1);
		},

		delete: function() {
			this.destroy();
		},

		attack: function(){
			this.p.attacking = true;
			if(this.p.direction == "right")
				this.p.vx = 200;
			else
				this.p.vx = -200;
		},

		finishAttack: function() {
			if(this.p.direction == "left")
				this.p.vx = -200;
			else
				this.p.vx = 200;

	  		this.p.attacking = false;
	  	},

		step: function(dt) {
			this.p.reload-=dt;
			if(this.p.y > 3500)
				this.die();
			if(this.p.vy == 0) {		// Sin caer.
				if (this.p.attacking == true) {
					this.p.vx = 0;
					this.play("attack_" + this.p.direction);
					Q.audio.play("sword_attack");
				}
				else {
					if(this.p.vx > 0) {
						this.play("run_right");
						this.p.direction = "right";
					}
					else {
						this.play("run_left");
						this.p.direction = "left";
					}
				}
		      		
		    }
		}
	});

	//Enemigo Robot
	Q.Sprite.extend("EnemyRobot", {
		init: function(p) {
			this._super(p, {
				sprite: "enemy_robot_anim",
				sheet: "Robot_IdleL_",
				vx: 0,
				x: 2000,
				y: 1750,
				direction_right: false,
				attacking: false, 
				attack: 100
			});

			this.add('2d, aiBounce, defaultEnemy, animation');

			this.on("EnemyAttacked", this, "finishAttack");

			//this.on("EnemyShooted", this, "finishShoot");
		},

		die: function() {
			this.destroy();
		},

		attack: function(){
			this.p.attacking = true;
			
		},

		/*finishShoot: function() {
			if (this.p.sheet ==  "Robot_Shoot_"){
				this.p.sheet =  "Robot_Idle_";
	      		this.play("stand_right");

			}
			else if(this.p.sheet ==  "Robot_ShootL_"){
				this.p.sheet =  "Robot_IdleL_";
	      		this.play("stand_left");
			}
	  	},*/

		finishAttack: function() {
			if (this.p.sheet ==  "EAttackL__"){
				this.p.vx = -200;

			}
			else if(this.p.sheet ==  "EAttack__"){
				this.p.vx = 200;
			}
	  		this.p.attacking = false;
	  	},

		step: function(dt) {
			if(this.p.direction_right == true) {					// Moviendo derecha.

				if (this.p.attacking == true){
					this.p.vx = 0;
					this.p.sheet =  "Melee_";
	      			this.play("attack_melee_right");
	      			Q.audio.play("sword_attack");
				}
				else{
					this.p.sheet =  "Robot_Shoot_";
					this.play("attack_shoot_right");
	      		}
					
		    } 
		    else if(this.p.direction_right == false) {					// Moviento izquierda.
		    	
		    	if (this.p.attacking == true){
		    		this.p.vx = 0;
					this.p.sheet =  "MeleeL_";
	      			this.play("attack_melee_left");
	      			Q.audio.play("sword_attack");
				}
				else{
					this.p.sheet =  "Robot_ShootL_";
					this.play("attack_shoot_left");
	      		}
		    } 
		}
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
			Q.stageScene("winGame", 1);		
			Q.stage().pause();
		}
	});

	Q.Sprite.extend("Acid", {
		init: function(p) {
			this._super(p, {
				sheet: "acid",
				sprite: "acid_anim",
				sensor: true
			});
			
			this.add("animation");

			this.on("sensor");

			this.play("acid_animation");
		},

		sensor: function() {
			Q.stageScene("loseGame", 1);		
			Q.stage().pause();
		}
	});

	Q.scene("startMenu", function(stage) {
		var container = stage.insert(new Q.UI.Container({
	      fill: "gray",
	      border: 5,
	      shadow: 10,
	      shadowColor: "rgba(0,0,0,0.2)",
	      y: Q.height/2,
	      x: Q.width/2, 
	      w: Q.width/2,
	      h: Q.height/2
	    }));

	    stage.insert(new Q.UI.Text({ 
			label: "Welcome to Ninja Adventures!",
			size: 30,
			color: "white",
			outlineWidth: 25,
			y: -100
	    }),container);
     // font          - font for text [weigth: 400, size: 24px, family: arial
	    stage.insert(new Q.UI.Button({
	    	label: "Start new game",
	    	font: {size: 2},
	    	/*color: "white",
	    	outlineWidth: 1,
	    	y: -20,*/
	    }, function() {
	    	this.p.label = "Presed";
	    }), container);

	    stage.insert(new Q.UI.Text({
	    	label: "Créditos",
	    	color: "white",
	    	outlineWidth: 1,
	    	y: 30
	    }), container);
	});

	// Escenario nivel 1.
	Q.scene("level1", function(stage) {
		Q.stageTMX("level.tmx", stage);

		var player = stage.insert(new Q.Ninja({x: 100, y: 500}));
		var enemy = stage.insert(new Q.EnemyNinja({x: 310, y: 500}));

		/*var fan = stage.insert(new Q.Fan({x: 210, y: 536}));
		var wind = stage.insert(new Q.Wind({x: fan.p.x, y: fan.p.y - 3.5*fan.p.h}));

		var acid = stage.insert(new Q.Acid({x: 310, y: 500}));

		stage.insert(new Q.Fin());*/

		Q.state.reset({life: player.p.life});
		Q.stageScene("HUD", 1);
		stage.add("viewport").follow(player);
		Q.audio.play("music_main", {loop: true});
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

	Q.loadTMX("level.tmx, ninja.png, ninja.json, wind.png, wind.json, fan.png, fan.json, acid.png, acid.json, enemy_ninja.png, enemy_ninja.json", function() {
		Q.compileSheets("ninja.png", "ninja.json");
		Q.compileSheets("wind.png", "wind.json");
		Q.compileSheets("fan.png", "fan.json");
		Q.compileSheets("acid.png", "acid.json");
		Q.compileSheets("enemy_ninja.png", "enemy_ninja.json");
		Q.load({
			"music_main": "music_main.mp3",
			"sword_attack": "sword_attack.mp3"
		}, function() {
			Q.animations("wind_anim", {
				wind_animation: { frames: [0, 1, 2, 3, 4, 5], rate: 1/6, loop: true}
			});

			Q.animations("fan_anim", {
				fan_animation: {frames: [0, 1, 2, 3], rate: 1/8, loop: true}
			});

			Q.animations("acid_anim", {
				acid_animation : {frames: [0, 1, 2, 3, 4, 5, 6, 7], rate: 1/4, loop: true}
			});

			Q.animations("ninja_anim", {
				stand_left        : {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], rate: 1/10, loop: true},
				stand_right       : {frames: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], rate: 1/10, loop: true},

				run_left          : {frames: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29], rate: 1/10, loop: true},
				run_right         : {frames: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39], rate: 1/10, loop: true},

				slide_left        : {frames: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49], rate: 1/10, loop: false},
				slide_right       : {frames: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59], rate: 1/10, loop: false},

				glide_left        : {frames: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69], rate: 1/10, loop: false},
				glide_right       : {frames: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79], rate: 1/10, loop: false},

				jump_left         : {frames: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89], rate: 1/10, loop: false},
				jump_right        : {frames: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99], rate: 1/10, loop: false},

				fall_left	      : {frames: [89], loop: false},
				fall_right	      : {frames: [99], loop: false},

				attack_left       : {frames: [100, 101, 102, 103, 104, 105, 106, 107, 108, 109], rate: 1/10, loop: false, trigger: "attacked"},
				attack_right      : {frames: [110, 111, 112, 113, 114, 115, 116, 117, 118, 119], rate: 1/10, loop: false, trigger: "attacked"},

				die_left	      : {frames: [120, 121, 122, 123, 124, 125, 126, 127, 128, 129], rate: 1/10, loop: false, trigger: "playerDie"},
				die_right         : {frames: [130, 131, 132, 133, 134, 135, 136, 137, 138, 139], rate: 1/10, loop: false, trigger: "playerDie"},

				attack_jump_left  : {frames: [140, 141, 142, 143, 144, 145, 146, 147, 148, 149], rate: 1/10, loop: false},
				attack_jump_right : {frames: [150, 151, 152, 153, 154, 155, 156, 157, 158, 159], rate: 1/10, loop: false},
				/*
				climb: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // Climb_

				throw_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Throw__
				throw_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // ThrowL__*/
			});

			Q.animations("enemy_ninja_anim", {
				stand_left   : {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], rate: 1/3, loop: true},
				stand_right  : {frames: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], rate: 1/3, loop: true},

				run_left     : {frames: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29], rate: 1/10, loop: true},
				run_right    : {frames: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39], rate: 1/10, loop: true},

				jump_left    : {frames: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49], rate: 1/10, loop: false},
				jump_right   : {frames: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59], rate: 1/10, loop: false},

				fall_left	 : {frames: [49], loop: false},
				fall_right   : {frames: [59], loop: false},

				attack_left  : {frames: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69], rate: 1/10, loop: false, trigger: "EnemyAttacked"},
				attack_right : {frames: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79], rate: 1/10, loop: false, trigger: "EnemyAttacked"},

				die_left     : {frames: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89], rate: 1/10, loop: false, trigger: "EnemyDie"},
				die_right    : {frames: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99], rate: 1/10, loop: false, trigger: "EnemyDie"}
			});

			Q.stageScene("level1", 0);
			//Q.stageScene("startMenu", 0);
		});
	});
});
