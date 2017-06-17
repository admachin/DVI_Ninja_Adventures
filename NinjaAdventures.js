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
					if(collision.obj.p.attacking == true || collision.obj.p.sliding == true){
						this.entity.die();
					}
					else{
						 this.entity.attack();
						 this.entity.p.direction_right = false;
						collision.obj.damage(this.entity.p.attack);
					}
			}
		
		},

		Right: function(collision) {
			if(collision.obj.isA("Ninja")) {
					if(collision.obj.p.attacking == true || collision.obj.p.sliding == true){
						this.entity.die();
					}
					else{
						 this.entity.attack();
						 this.entity.p.direction_right = true;
						collision.obj.damage(this.entity.p.attack);
					}
			}
		
		},

		colisiones: function(collision) {
			if(collision.obj.isA("Ninja")) {
					if(collision.obj.p.attacking == true || collision.obj.p.sliding == true){
						this.entity.die();
					}
					else{
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
			  life: 500,
			  reloadTime: 0.5,
			  reload: 0.5
			});

			this.add('2d, platformerControls, animation');


			this.play("stand_right");

			this.on("attacked", this, "finishAttack");

			this.on("hit", this, "collision");
		},

		collision: function(col) {
			if(col.obj.isA("Wind")) {	// Set the collision with the wind to be able to go inside it.
				console.log("colision");
				this.p.x += col.separate[0];
				this.p.y += col.separate[1];
				// Play the flying animation.
				this.play("glide_" + this.p.direction);
				this.p.vy = -1000;
			}
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
			if(this.p.vx == 0 && this.p.vy == 0)
				this.play("stand_" + this.p.direction);
			if(this.p.vx != 0 && this.p.vy == 0) 
				this.play("run_" + this.p.direction);
			if(this.p.sliding)
				this.play("slide_" + this.p.direction);
			if(this.p.flying)
				this.play("glide_" + this.p.direction);
			if(Q.inputs['up'])
				this.play("jump_" + this.p.direction);
			if(Q.inputs['attack']) {
				this.play("attack_" + this.p.direction);
		      	Q.audio.play("sword_attack", {debounce: 500});
		      }
			

			//console.log("x: " + this.p.x + "   -   y: " + this.p.y);
			/*this.p.reload-=dt;
			if(this.p.y > 3500) {
				this.die();
			}
			if(this.p.death == true) {	// Muerto.
				//this.play("die_" + this.p.direction);
				Q.stage().pause();
				Q.stageScene("loseGame", 1);
			}
			else {						// No muerto.
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
				      	Q.audio.play("sword_attack", {debounce: 500});
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
				      	Q.audio.play("sword_attack", {debounce: 500});
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
						      	Q.audio.play("sword_attack", {debounce: 500});
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
						      	Q.audio.play("sword_attack", {debounce: 500});
						      	this.p.attacking = true;
							}
							else {
								this.p.sheet =  "Idle__";
								this.play("stand_right");
							}
						}
					}
		    	}
			}*/
				
		}
	});

	Q.Sprite.extend("Fan", {	// Sprite to represent the fan foot.
		init: function(p) {
			this._super(p, {
				sheet: "Fan",
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
				sheet: "Wind",
				sprite: "wind_anim"
			});
			this.add("animation");

			this.play("wind_animation");
		}
	});

	//Enemigo Ninja
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

			/*this.on("bump.left, bump.right, bump.bottom", function(collision) {
				this.colide(collision);
			});*/
		},

		die: function() {
			this.destroy();
		},

		attack: function(){
			this.p.attacking = true;
			
		},

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
			if(this.p.vx > 0 && this.p.vy == 0) {					// Moviendo derecha.

				if (this.p.attacking == true){
					this.p.vx = 0;
					this.p.sheet =  "EAttackL__";
	      			this.play("attack_left");
	      			Q.audio.play("sword_attack");
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
	      			Q.audio.play("sword_attack");
				}
				else{
					this.p.sheet =  "ERunL__";
		      		this.play("run_left");
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
				asset: "acido",				
				sheet: "acido",
				sensor: true
			});
			
			this.on("sensor");
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

		var player = stage.insert(new Q.Ninja({x: 10, y: 0}));
		//var enemy = stage.insert(new Q.EnemyGirl());

		/*var fan2 = stage.insert(new Q.Fan({x: 17294, y: 3108}));
		var wind2 = stage.insert(new Q.Wind({x: fan2.p.x, y: fan2.p.y - 3.5*fan2.p.h}));

		var fan4 = stage.insert(new Q.Fan({x: 24410, y: 1500}));
		var wind4 = stage.insert(new Q.Wind({x: fan4.p.x, y: fan4.p.y - 3.5*fan4.p.h}));

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

	Q.loadTMX("level.tmx, ninja.png, ninja.json", function() {
		Q.compileSheets("ninja.png", "ninja.json");
		Q.load({
			"music_main": "music_main.mp3",
			"sword_attack": "sword_attack.mp3"
		}, function() {
			/**Q.animations("wind_anim", {
				wind_animation: { frames: [0, 1, 2, 3, 4, 5], rate: 1/6, loop: true}	// Wind
			});

			Q.animations("fan_anim", {
				fan_animation: {frames: [0, 1, 2, 3], rate: 1/8, loop: true}	// Fan
			});*/

			//Animaciones Ninja
			Q.animations("ninja_anim", {
				stand_left   : {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], rate: 1/10, loop: true},
				stand_right  : {frames: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], rate: 1/10, loop: true},

				run_left     : {frames: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29], rate: 1/10, loop: true},
				run_right    : {frames: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39], rate: 1/10, loop: true},

				slide_left   : {frames: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49], rate: 1/10, loop: false},
				slide_right  : {frames: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59], rate: 1/10, loop: false},

				glide_left   : {frames: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69], rate: 1/10, loop: false},
				glide_right  : {frames: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79], rate: 1/10, loop: false},

				jump_left    : {frames: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89], rate: 1/10, loop: false},
				jump_right   : {frames: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99], rate: 1/10, loop: false},

				attack_left  : {frames: [100, 101, 102, 103, 104, 105, 106, 107, 108, 109], rate: 1/10, loop: true},
				attack_right : {frames: [110, 111, 112, 113, 114, 115, 116, 117, 118, 119], rate: 1/10, loop: true}
				/*

				climb: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: true }, // Climb_




				fall_right: { frames: [9], loop: false }, // Jump__
				fall_left: { frames: [9], loop: false }, // JumpL__

				jumpAttack_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Jump_Attack__
				jumpAttack_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Jump_AttackL__



				throw_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Throw__
				throw_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // ThrowL__
				
				die_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Dead__
				die_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // DeadL__*/
			});

			// Animaciones acido.
			Q.animations("acid_anim", {
				acido: { frames: [1]}
			});

			Q.stageScene("level1", 0);
			//Q.stageScene("startMenu", 0);
		});
	});
});
