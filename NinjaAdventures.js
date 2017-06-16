	window.addEventListener("load", function() {
	var Q = window.Q = Quintus()
				.include("Scenes, Sprites, Input, UI, Touch, TMX, 2D, Anim, Audio")
				.setup({maximize: true})
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

			this.on("hit", this, "collision");
		},
		// Set the collision with the fan to be able to go inside it.
		collision: function(col) {
			if(col.obj.isA("Fan")) {
				this.p.x += col.separate[0];
				this.p.y += col.separate[1];
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
			}
				
		}
	});

	Q.Sprite.extend("FanFoot", {	// Sprite to represent the fan foot.
		init: function(p) {
			this._super(p, {
				sheet: "Tile ",
				x: 240,
				y: 1828
			});
		}
	});
	
	Q.Sprite.extend("Fan", {	// Sprite with no sheet to make ninja fly when he goes into it.
		init: function(p) {
			this._super(p, {
				h: 1000		// Fan height.
			});
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

	// Escenario nivel 1.
	Q.scene("level1", function(stage) {
		Q.stageTMX("level.tmx", stage);

		var player = stage.insert(new Q.Ninja());
		//var enemy = stage.insert(new Q.EnemyGirl());

		var fanFoot = stage.insert(new Q.FanFoot());														// Insert the fan foot.
		var fan = stage.insert(new Q.Fan({x: fanFoot.p.x, y: fanFoot.p.y - fanFoot.p.h, w:fanFoot.p.w}));	// Insert the fan with the logic in top of the foot and with the same width.

		stage.insert(new Q.Fin());

		Q.state.reset({life: player.p.life});
		Q.stageScene("HUD", 1);
		stage.add("viewport").follow(player);
		stage.viewport.scale = 1/3;
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

	Q.loadTMX("level.tmx, mario_small.png, mario_small.json, Proyectiles.png, Proyectiles.json, Robot1.png, Robot1.json, Robot2.png, Robot2.json, Ninja1.png, Ninja1.json, Ninja2.png, Ninja2.json, Ninja3.png, Ninja3.json, Ninja4.png, Ninja4.json, coin.png, coin.json, EnemyNinja1.png, EnemyNinja1.json, EnemyNinja2.png, EnemyNinja2.json, EnemyNinja3.png, EnemyNinja3.json, acido.png, acido.json, music_main.mp3, sword_attack.mp3, escenario2.png, escenario2.json", function() {
		Q.compileSheets("mario_small.png", "mario_small.json");
		Q.compileSheets("Ninja1.png", "Ninja1.json");
		Q.compileSheets("Ninja2.png", "Ninja2.json");
		Q.compileSheets("Ninja3.png", "Ninja3.json");
		Q.compileSheets("Ninja4.png", "Ninja4.json");
		Q.compileSheets("coin.png", "coin.json");
		Q.compileSheets("acido.png", "acido.json");
		Q.compileSheets("EnemyNinja1.png", "EnemyNinja1.json");
		Q.compileSheets("EnemyNinja2.png", "EnemyNinja2.json");
		Q.compileSheets("EnemyNinja3.png", "EnemyNinja3.json");
		Q.compileSheets("Proyectiles.png", "Proyectiles.json");
		Q.compileSheets("Robot1.png", "Robot1.json");
		Q.compileSheets("Robot2.png", "Robot2.json");
		Q.compileSheets("escenario2.png", "escenario2.json");
		Q.load({
			"music_main": "music_main.mp3",
			"sword_attack": "sword_attack.mp3"
		}, function() {
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
			
			//Animaciones Enemigo Robot
			Q.animations("enemy_robot_anim", {
				attack_melee_right: { frames: [0,1,2,3,4,5,6,7], rate: 1/10, loop: false, trigger: "EnemyAttacked"  }, // Melee_
				attack_melee_left: { frames: [0,1,2,3,4,5,6,7], rate: 1/10, loop: false, trigger: "EnemyAttacked"  }, // MeleeL_

				run_right: { frames: [0,1,2,3,4,5,6,7], rate: 1/10, loop: true }, // Robot_Run_
				run_left: { frames: [0,1,2,3,4,5,6,7], rate: 1/10, loop: true }, // Robot_RunL_
				
				/*attack_shoot_right: { frames: [0,1,2,3], rate: 1/2, loop: false, trigger: "EnemyShooted"  }, // Robot_Shoot_
				attack_shoot_left: { frames: [0,1,2,3], rate: 1/2, loop: false, trigger: "EnemyShooted"  }, // Robot_ShootL_*/

				attack_shoot_right: { frames: [0,1,2,3], rate: 1/2, loop: false}, // Robot_Shoot_
				attack_shoot_left: { frames: [0,1,2,3], rate: 1/2, loop: false}, // Robot_ShootL_
				
				stand_right: { frames: [0,1,2], rate: 1/2, loop: true }, // Robot_Idle_
				stand_left: { frames: [0,1,2], rate: 1/2, loop: true }, // Robot_IdleL_

				jump_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Robot_Jump_
				jump_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Robot_JumpL_
				
				fall_right: { frames: [9], rate: 1/10, loop: false }, // Robot_Jump_
				fall_left: { frames: [9], rate: 1/10, loop: false }, // Robot_JumpL_

				die_right: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Robot_Dead_
				die_left: { frames: [0,1,2,3,4,5,6,7,8,9], rate: 1/10, loop: false }, // Robot_DeadL_
			});
			
			//Animaciones Proyectiles
			Q.animations("proyectiles_anim", {
				
				Fireball_right: { frames: [0,1,2,3,4], rate: 1/10, loop: true}, // Fireball
				Fireball_left: { frames: [0,1,2,3,4], rate: 1/10, loop: true}, // LFireball

				Kunai_right: { frames: [0], rate: 1/10, loop: true }, // Kunai
				Kunai_left: { frames: [1], rate: 1/10, loop: true }, // Kunai
				
				Explosion: { frames: [0,1,2,3,4], rate: 1/10, loop: false}, // Explosion
				
			});

			// Animaciones acido.
			Q.animations("acid_anim", {
				acido: { frames: [1]}
			});
			Q.stageScene("level1", 0);
		});
	});
});
