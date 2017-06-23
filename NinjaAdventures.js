	window.addEventListener("load", function() {
	var Q = window.Q = Quintus({ development: true })
				.include("Scenes, Sprites, Input, UI, Touch, TMX, 2D, Anim, Audio")
				.setup({ maximize: true})
				.controls()
				.touch()
				.enableSound();
	//defaultEnemy
	Q.component("defaultEnemy", {
		added: function() {
			this.entity.on("bump.left", this, "left");
			this.entity.on("bump.right", this, "right");
			//this.entity.on("hit", this, "collision");
			//this.entity.on("bump.bottom, bump.top", this, "colisiones");
		},


		left: function(collision) {
			if(collision.obj.isA("Food") || collision.obj.isA("Coin"))	// To avoid enemies to move the food.
				this.entity.p.x -= (collision.obj.p.w + this.entity.p.w);
			else if(collision.obj.isA("Ninja")) {
				this.entity.p.direction = "left";
				if(collision.obj.p.attacking == true || collision.obj.p.sliding == true)
					this.entity.damage(collision.obj.p.attack);
				else {
					this.entity.attack();
					collision.obj.damage(this.entity.p.attack);
				}
			}
			else if(collision.obj.isA("NinjaKunai")) {
				this.entity.damage(collision.obj.p.attack);
				collision.obj.destroy();
			}
		
		},

		right: function(collision) {
			if(collision.obj.isA("Food") || collision.obj.isA("Coin"))	// To avoid enemies to move the food.
				this.entity.p.x += collision.obj.p.w + this.entity.p.w;
			else if(collision.obj.isA("Ninja")) {
				this.entity.p.direction = "right";
				if(collision.obj.p.attacking == true || collision.obj.p.sliding == true)
					this.entity.damage(collision.obj.p.attack);
				else {
					this.entity.attack();
					collision.obj.damage(this.entity.p.attack);
				}
			}
			else if(collision.obj.isA("NinjaKunai")) {
				this.entity.damage(collision.obj.p.attack);
				collision.obj.destroy();
			}
		
		},

		collision: function(col) {
			if(col.obj.isA("Food") || col.obj.isA("Coin")) {	// To avoid enemies to move the food.
				if(this.entity.p.direction == "right")
					this.entity.p.x += (col.obj.p.w + this.entity.p.w);
				else if(this.entity.p.direction == "left")
					this.entity.p.x -= (col.obj.p.w + this.entity.p.w);
			}
			else if(col.obj.isA("NinjaKunai")) {
				this.entity.damage(col.obj.p.attack);
				col.obj.destroy();
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

			this.on("throwKunai", this, "throw");
		},

		throw: function() {
			Q.audio.play("kunai_noise");
			if(this.p.direction == "right")
				Q.stage().insert(new Q.NinjaKunai({x: this.p.x + this.p.w, y: this.p.y, direction: this.p.direction, vx: 400, init: this.p.x}));
			else if(this.p.direction == "left")
				Q.stage().insert(new Q.NinjaKunai({x: this.p.x - this.p.w, y: this.p.y, direction: this.p.direction, vx: -400, init: this.p.x}));
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
			Q.audio.stop("music_main");
			Q.audio.play("game_over", {debounce: 500});
			Q.audio.play("game_over_screen", {loop: true});
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
				else if(Q.inputs['action'])
					this.play("throw_" + this.p.direction, 1);
				if(this.p.vy != 0) {							// En el aire cayendo.
					if(this.p.flying)
						this.play("glide_" + this.p.direction, 2);
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

	Q.Sprite.extend("Fan", {	// Sprite to represent the fan itself.
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
				vx: -80,
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
			Q.audio.play("woman_scream", {debounce: 500});
			this.play("die_" + this.p.direction, 2);
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
					Q.audio.play("sword_attack", {debounce: 500});
				}
				else {
					if(this.p.vx > 0)
						this.p.direction = "right";
					else if(this.p.vx < 0)
						this.p.direction = "left";
					this.play("run_" + this.p.direction);
				}
		      		
		    }
		}
	});

	//Enemigo Robot
	Q.Sprite.extend("EnemyRobot", {
		init: function(p) {
			this._super(p, {
				sheet: "enemy_robotL",
				sprite: "enemy_robot_anim",
				vx: -35,
				x: 0,
				y: 0,
				direction: "left",
				attacking: false, 
				attack: 100,
				life: 300,
				shootTimeInit: 5,
				shootTime: 5,
				reloadTime: 0.5,
				reload: 0.5
			});

			this.add('2d, aiBounce, defaultEnemy, animation');

			this.on("EnemyAttacked", this, "finishAttack");

			this.on("EnemyShooted", this, "finishShoot");

			this.on("EnemyDie", this, "delete");
		},

		damage: function(attack) {
			if(this.p.reload < 0) {
				this.p.reload = this.p.reloadTime;
				this.p.life -= attack;
				if(this.p.life <= 0)
					this.die();
			}	
		},

		die: function() {
			Q.audio.play("robot_noise", {debounce: 500});
			this.play("die_" + this.p.direction, 1);
		},

		delete: function() {
			this.destroy();
		},

		attack: function() {
			this.p.attacking = true;
		},

		finishShoot: function() {
			if(this.p.direction == "left")
				this.p.vx = -100;
			else if(this.p.direction == "right")
				this.p.vx = 100;
			this.play("run_" + this.p.direction);
	  	},

		finishAttack: function() {
			if(this.p.direction == "left")
				this.p.vx = -100;
			else if(this.p.direction == "right")
				this.p.vx = 100;
	  		this.p.attacking = false;
	  	},

		step: function(dt) {
			this.p.reload -= dt;
			this.p.shootTime -= dt;
			if(this.p.y > 3500)
				this.die();
			if(this.p.vy == 0) {
				if(this.p.attacking == true) {
					this.p.vx = 0;
					this.play("attack_" + this.p.direction);
					Q.audio.play("sword_attack", {debounce: 500});
				}
				else {
					if(this.p.shootTime <= 0) {
						this.p.shootTime = this.p.shootTimeInit;
						this.vx = 0;
						this.play("missile_" + this.p.direction, 1);
						if(this.p.direction == "left")
							Q.stage().insert(new Q.RobotMissile({x: this.p.x - this.p.w, y: this.p.y, direction: this.p.direction, vx: -500, init: this.p.x}));
						else
							Q.stage().insert(new Q.RobotMissile({x: this.p.x + this.p.w, y: this.p.y, direction: this.p.direction, vx: 500, init: this.p.x}));
						
					}
					else {
						if(this.p.vx > 0)
							this.p.direction = "right";
						else
							this.p.direction = "left";
						this.play("run_" + this.p.direction);
					}
				}
			}
		}
	});

	Q.Sprite.extend("RobotMissile", {
		init: function(p) {
			this._super(p, {
				sheet: "missileL",
				sprite: "missile_anim",
				damage: 200,
				vx: -500,
				direction: "left",
				init: 0,
				max: 1000
			});

			this.add("animation");

			this.play("missile_" + this.p.direction);

			this.on("hit", this, "collision");

			this.on("MissileImpact", this, "delete");
		},

		collision: function(col) {
			if(col.obj.isA("Ninja")){
				col.obj.damage(this.p.damage);
			}
			this.destroy();
			Q.audio.play("explosion", {debounce: 500});
			
			this.p.sheet = "explosion";
			this.p.sprite = "explosion_anim";
			this.play("explosion_animation", 1);
				
		},

		delete: function() {
			this.destroy();
		},

		step: function(dt) {
			this.p.x += this.p.vx * dt;
			if(this.p.x < this.p.init - this.p.max || this.p.x > this.p.init + this.p.max)
				this.destroy();
		}
	});

	Q.Sprite.extend("NinjaKunai", {
		init: function(p) {
			this._super(p, {
				sheet: "kunaiR",
				sprite: "kunai_anim",
				attack: 200,
				vx: -400,
				direction: "left",
				init: 0,
				max: 1000
			});

			this.add("animation");

			this.play("kunai_" + this.p.direction);

			this.on("hit", this, "collision");
		},

		collision: function(col) {
			this.destroy();
		},

		step: function(dt) {
			this.p.x += this.p.vx * dt;
			if(this.p.x < this.p.init - this.p.max || this.p.x > this.p.init + this.p.max)
				this.destroy();
		}	
	});

	//Boss
	Q.Sprite.extend("Boss", {
		init: function(p) {
			this._super(p, {
				sheet: "bossL",
				sprite: "boss_anim",
				vx: -80,
				x: 0,
				y: 0,
				attacking: false, 
				attack: 400,
				direction: "left",
				life: 1000,
				reloadTime: 0.5,
				reload: 0.5
			});

			this.add('2d, aiBounce, defaultEnemy, animation');
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
			Q.audio.stop("music_main");
			Q.audio.play("monster_die");
			Q.stage().pause();
			Q.stageScene("levelComplete", 1);
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
				
				if(this.p.vx > 0)
					this.p.direction = "right";
				else if(this.p.vx < 0)
					this.p.direction = "left";
				this.play("boss_" + this.p.direction);
		      		
		    }
		}
	});


	Q.Sprite.extend("Master", {
		init: function(p) {
			this._super(p, {
				sheet: "masterL",
				sensor: true
			});

			this.add("2d, tween");
			
			this.on("sensor");
		},

		sensor: function() {
			Q.audio.stop();
			Q.audio.play("win_game");
			Q.stageScene("winGame", 1);
			Q.stage().pause();
		}
	});

	Q.Sprite.extend("Acid", {
		init: function(p) {
			this._super(p, {
				sheet: "acid",
				sprite: "acid_anim"
			});
			
			this.add("animation");

			this.on("hit", this, "collision");

			this.play("acid_animation");
		},

		collision: function(col) {
			if(col.obj.isA("Ninja"))
				col.obj.die();
		}
	});

	Q.Sprite.extend("Food", {
		init: function(p) {
			this._super(p, {
				sheet: "chicken",
				healPower: 300
			});
			this.add("2d");
			this.on("hit", this, "heal");
		},

		heal: function(col) {
			if(col.obj.isA("Ninja")) {
				Q.state.inc("life", this.p.healPower);
				col.obj.p.life += this.p.healPower;
				Q.audio.play("food_eat");
				this.destroy();
			}
		}
	});

	Q.Sprite.extend("Coin", {
		init: function(p) {
			this._super(p, {
				sheet: "coin",
				sprite: "coin_anim"
			});
			this.add("animation, 2d");

			this.on("hit", this, "catch");

			this.play("coin_animation");
		},

		catch: function(col) {
			if(col.obj.isA("Ninja")) {
				Q.audio.play("coin_catched");
				Q.state.inc("coin", 1);
				this.destroy();
			}
		}

		// Hacer sensor con el sprite y que añada al state la puncuación.
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
	      h: (Q.height/2) + 150
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
	    	Q.clearStages();
			Q.stageScene('level1');
	    }), container);


	    stage.insert(new Q.UI.Button({
	    	label: "Desarrolladores",
	    	color: "white",
	    	outlineWidth: 1,
	    	y: 60
	    }, function() {
	    	Q.clearStages();
			Q.stageScene('Desarrolladores');
	    }), container);

	    stage.insert(new Q.UI.Button({
	    	label: "Controles",
	    	color: "white",
	    	outlineWidth: 1,
	    	y: 100
	    }, function() {
	    	Q.clearStages();
			Q.stageScene('Controles');
	    }), container);

	    stage.insert(new Q.UI.Button({
	    	label: "Fuentes",
	    	color: "white",
	    	outlineWidth: 1,
	    	y: 140
	    }, function() {
	    	Q.clearStages();
			Q.stageScene('Fuentes');
	    }), container);
	});

	// Escenario nivel 1.
	Q.scene("level1", function(stage) {
		Q.audio.stop();
		Q.stageTMX("level.tmx", stage);

		var player = stage.insert(new Q.Ninja({x: 100, y: 550}));
		var boss = stage.insert(new Q.Boss({x:2900, y:200, vx: -50}));
		
		//Comida
		var food = stage.insert(new Q.Food({x: 465, y: 465, sheet: "rice", healPower: 200}));
		var food2 = stage.insert(new Q.Food({x: 592, y: 465}));
		var food3 = stage.insert(new Q.Food({x: 720, y: 465, sheet: "sushi", healPower: 100}));
		//var food4 = stage.insert(new Q.Food({x: 2703, y: 450, sheet: "sushi", healPower: 100}));
		//var food5 = stage.insert(new Q.Food({x: 3060, y: 200}));

		//Monedas
		var coin = stage.insert(new Q.Coin({x:530, y:465}));
		var coin2 = stage.insert(new Q.Coin({x:655, y:465}));
		//var coin3 = stage.insert(new Q.Coin({x:2995, y:400}));
		
		//Ventiladores
		var fan = stage.insert(new Q.Fan({x: 420, y: 250}));
		var wind = stage.insert(new Q.Wind({x: fan.p.x, y: fan.p.y - 3.5*fan.p.h}));

		var fan2 = stage.insert(new Q.Fan({x: 900, y: 400}));
		var wind2 = stage.insert(new Q.Wind({x: fan2.p.x, y: fan2.p.y - 3.5*fan2.p.h}));

		var fan3 = stage.insert(new Q.Fan({x: 1050, y: 450}));
		var wind3 = stage.insert(new Q.Wind({x: fan3.p.x, y: fan3.p.y - 3.5*fan3.p.h}));

		var fan4 = stage.insert(new Q.Fan({x: 670, y: 200}));
		var wind4 = stage.insert(new Q.Wind({x: fan4.p.x, y: fan4.p.y - 3.5*fan4.p.h}));

		var fan5 = stage.insert(new Q.Fan({x: 1400, y: 380}));
		var wind5 = stage.insert(new Q.Wind({x: fan5.p.x, y: fan5.p.y - 3.5*fan5.p.h}));

		var fan6 = stage.insert(new Q.Fan({x: 1600, y: 350}));
		var wind6 = stage.insert(new Q.Wind({x: fan6.p.x, y: fan6.p.y - 3.5*fan6.p.h}));

		var fan9 = stage.insert(new Q.Fan({x: 1800, y: 280}));
		var wind9 = stage.insert(new Q.Wind({x: fan9.p.x, y: fan9.p.y - 3.5*fan9.p.h}));

		var fan8 = stage.insert(new Q.Fan({x: 2000, y: 230}));
		var wind8 = stage.insert(new Q.Wind({x: fan8.p.x, y: fan8.p.y - 3.5*fan8.p.h}));

		var fan7 = stage.insert(new Q.Fan({x: 2200, y: 200}));
		var wind7 = stage.insert(new Q.Wind({x: fan7.p.x, y: fan7.p.y - 3.5*fan7.p.h}));

		var fan10 = stage.insert(new Q.Fan({x: 2400, y: 170}));
		var wind10 = stage.insert(new Q.Wind({x: fan10.p.x, y: fan10.p.y - 3.5*fan10.p.h}));

		
		//Enemigos
			//Ninjas
			var ninjaEnemy = stage.insert(new Q.EnemyNinja({x: 500, y: 500}));
			var ninjaEnemy2 = stage.insert(new Q.EnemyNinja({x: 1000, y: 500}));
			var ninjaEnemy3 = stage.insert(new Q.EnemyNinja({x: 600, y: 300}));
		

			//Robots
			var robot = stage.insert(new Q.EnemyRobot({x: 530, y: 400}));
			var robot2 = stage.insert(new Q.EnemyRobot({x: 800, y: 500}));
			var robot3 = stage.insert(new Q.EnemyRobot({x: 1000, y: 200}));

		//var master = stage.insert(new Q.Master({x: 3150, y: 100}));

		Q.state.reset({life: player.p.life, coin: 0});
		Q.stageScene("HUD", 1);
		stage.add("viewport").follow(player);
		stage.viewport.scale = 1.5;
		Q.audio.play("music_main", {loop: true});
	});

	// Escenario nivel 1.
	Q.scene("level2", function(stage) {
		Q.audio.stop();
		Q.stageTMX("level2.tmx", stage);

		var player = stage.insert(new Q.Ninja({x: 100, y: 550}));
		
		//Comida
		var food = stage.insert(new Q.Food({x: 160, y: 370, sheet: "rice", healPower: 200}));
		var food2 = stage.insert(new Q.Food({x: 1600, y: 250}));
		var food3 = stage.insert(new Q.Food({x: 2270, y: 250, sheet: "rice", healPower: 200}));
		var food4 = stage.insert(new Q.Food({x: 2703, y: 450, sheet: "sushi", healPower: 100}));
		var food5 = stage.insert(new Q.Food({x: 3060, y: 200}));

		//Monedas
		var coin = stage.insert(new Q.Coin({x:273, y:100}));
		var coin2 = stage.insert(new Q.Coin({x:2865, y:100}));
		var coin3 = stage.insert(new Q.Coin({x:2995, y:400}));

		//Ventiladores
		var fan = stage.insert(new Q.Fan({x: 350, y: 496}));
		var wind = stage.insert(new Q.Wind({x: fan.p.x, y: fan.p.y - 3.5*fan.p.h}));

		var fan2 = stage.insert(new Q.Fan({x: 200, y: 200}));
		var wind2 = stage.insert(new Q.Wind({x: fan2.p.x, y: fan2.p.y - 3.5*fan2.p.h}));

		var fan3 = stage.insert(new Q.Fan({x: 800, y: 300}));
		var wind3 = stage.insert(new Q.Wind({x: fan3.p.x, y: fan3.p.y - 3.5*fan3.p.h}));

		var fan4 = stage.insert(new Q.Fan({x: 1000, y: 230}));
		var wind4 = stage.insert(new Q.Wind({x: fan4.p.x, y: fan4.p.y - 3.5*fan4.p.h}));

		var fan5 = stage.insert(new Q.Fan({x: 1800, y: 380}));
		var wind5 = stage.insert(new Q.Wind({x: fan5.p.x, y: fan5.p.y - 3.5*fan5.p.h}));

		var fan6 = stage.insert(new Q.Fan({x: 2375, y: 300}));
		var wind6 = stage.insert(new Q.Wind({x: fan6.p.x, y: fan6.p.y - 3.5*fan6.p.h}));

		//var fan7 = stage.insert(new Q.Fan({x: 2785, y: 420}));
		//var wind7 = stage.insert(new Q.Wind({x: fan7.p.x, y: fan7.p.y - 3.5*fan7.p.h}));


		var fan9 = stage.insert(new Q.Fan({x: 2785, y: 450}));
		var wind9 = stage.insert(new Q.Wind({x: fan9.p.x, y: fan9.p.y - 3.5*fan9.p.h}));

		var fan8 = stage.insert(new Q.Fan({x: 2930, y: 350}));
		var wind8 = stage.insert(new Q.Wind({x: fan8.p.x, y: fan8.p.y - 3.5*fan8.p.h}));

		//Enemigos
			//Ninjas
			var ninjaEnemy = stage.insert(new Q.EnemyNinja({x: 1300, y: 250}));
			var ninjaEnemy2 = stage.insert(new Q.EnemyNinja({x: 1550, y: 500}));
			var ninjaEnemy3 = stage.insert(new Q.EnemyNinja({x: 2550, y: 500}));
		

			//Robots
			var robot = stage.insert(new Q.EnemyRobot({x: 2050, y: 300}));
			var robot2 = stage.insert(new Q.EnemyRobot({x: 2550, y: 200}));


		var master = stage.insert(new Q.Master({x: 3150, y: 100}));
		
		stage.add("viewport").follow(player);
		stage.viewport.scale = 1.5;
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
		
		var button2 = container.insert(new Q.UI.Button({
			x: 0,
			y: 50,
			fill: "#CCCCCC",
            label: "Inicio"
        }));

		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level1');
		});

		button2.on("click",function() {
			Q.clearStages();
			Q.stageScene('startMenu');
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

		var button2 = container.insert(new Q.UI.Button({
			x: 0,
			y: 60,
			fill: "#CCCCCC",
            label: "Inicio"
        }));

		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level1');
		});

		button2.on("click",function() {
			Q.clearStages();
			Q.stageScene('startMenu');
		});

		container.fit(20);
	});

	Q.scene("levelComplete", function(stage) {
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2,
			y: Q.height/2,
			fill: "rgba(0,0,0,0.5)"
		}));
		var button = container.insert(new Q.UI.Button({
			x: 0,
			y: 0,
			fill: "#CCCCCC",
            label: "Next level"
        }));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -15 - button.p.h,
			color: "green",
			label: "Level complete!"
		}));

		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level2');
		});

		container.fit(20);
	});

	// Creditos
	Q.scene("Controles", function(stage) {
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2,
			y: (Q.height/2) + 100,
			border: 5,
			fill: "rgba(0,0,0,0.5)"
		}));
		var button = container.insert(new Q.UI.Button({
			x: 0,
			y: 0,
			fill: "#CCCCCC",
            label: "Inicio"
        }));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -15 - button.p.h,
			color: "black",
			label: "Volver a inicio"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -240 - button.p.h,
			color: "black",
			label: "Controles: "
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -200 - button.p.h,
			size: 18,
			color: "white",
			label: "Flechas Derecha e Izquierda: para moverse hacia delante y detras respectivamente."
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -175 - button.p.h,
			size: 18,
			color: "white",
			label: "Flecha Arriba: para saltar (Existe la posibilidad de pegar un salto en el aire)."
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -150 - button.p.h,
			size: 18,
			color: "white",
			label: "Flecha Abajo + Flecha Derecha/Izquierda: nos deslizamos (Sirve para atacar a los Enemigos)."
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -125 - button.p.h,
			size: 18,
			color: "white",
			label: "Barra espaciadora: sacar la capa (Solo si estamos en el aire)."
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -100 - button.p.h,
			size: 18,
			color: "white",
			label: "Z: atacar con espada (Sirve para atacar a los Enemigos)."
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -75 - button.p.h,
			size: 18,
			color: "white",
			label: "X: lanza kunais (Sirve para atacar a los Enemigos)."
		}));

		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('startMenu');
		});

		container.fit(20);
	});

	// Creditos
	Q.scene("Desarrolladores", function(stage) {
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2,
			y: Q.height/2,
			border: 5,
			fill: "rgba(0,0,0,0.5)"
		}));
		var button = container.insert(new Q.UI.Button({
			x: 0,
			y: 0,
			fill: "#CCCCCC",
            label: "Inicio"
        }));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -15 - button.p.h,
			color: "black",
			label: "Volver a inicio"
		}));

		var label = container.insert(new Q.UI.Text({
			x: -40,
			y: -175 - button.p.h,
			color: "black",
			label: "Desarrolladores: "
		}));

		var label = container.insert(new Q.UI.Text({
			x: 20,
			y: -135 - button.p.h,
			color: "white",
			label: "- Adolfo Machín Fernández "
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -115 - button.p.h,
			color: "white",
			label: "- Fernando Rivilla Bravo"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -95 - button.p.h,
			color: "white",
			label: "- Carlos Raspeño Priego"
		}));

		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('startMenu');
		});

		container.fit(20);
	});

	// Creditos
	Q.scene("Fuentes", function(stage) {
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2,
			y: Q.height/2,
			border: 5,
			fill: "rgba(0,0,0,0.5)"
		}));
		var button = container.insert(new Q.UI.Button({
			x: 0,
			y: 100,
			fill: "#CCCCCC",
            label: "Siguiente"
        }));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: 82 - button.p.h,
			color: "black",
			label: "Siguiente pagina"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -205 - button.p.h,
			color: "black",
			label: "Sprites: "
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -165 - button.p.h,
			size: 18,
			color: "white",
			label: "Personajes y Tiles: //www.gameart2d.com/"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -140 - button.p.h,
			size: 18,
			color: "white",
			label: "Viento ventilador: http://piq.codeus.net/picture/209221/wind_element"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -115 - button.p.h,
			size: 18,
			color: "white",
			label: "Hélice ventilador: http://ludumdare.com/compo/tag/sprites/"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -90   - button.p.h,
			size: 18,
			color: "white",
			label: "Comida: https://es.pinterest.com/pin/568227677957155806/"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -65  - button.p.h,
			size: 18,
			color: "white",
			label: "Explosión: http://fralexion.deviantart.com/gallery/48550334/Animation-Assets"
		}));

		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('Fuentes2');
		});

		container.fit(20);
	});

	Q.scene("Fuentes2", function(stage) {
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2,
			y: Q.height/2,
			border: 5,
			fill: "rgba(0,0,0,0.5)"
		}));
		var button = container.insert(new Q.UI.Button({
			x: 0,
			y: 200,
			fill: "#CCCCCC",
            label: "Inicio"
        }));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: 190 - button.p.h,
			color: "black",
			label: "Volver a inicio"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -205  - button.p.h,
			color: "black",
			label: "Sonidos:"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -165  - button.p.h,
			size: 18,
			color: "white",
			label: "Comer: http://www.freesound.org/people/josepharaoh99/sounds/353067/"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -140  - button.p.h,
			size: 18,
			color: "white",
			label: "Robot: http://www.freesound.org/people/ShahruhAudio/sounds/336882/"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -115  - button.p.h,
			size: 18,
			color: "white",
			label: "Grito mujer: http://www.freesound.org/people/GabrielaUPF/sounds/220295/"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -90  - button.p.h,
			size: 18,
			color: "white",
			label: "Grito hombre: http://www.freesound.org/people/HazMattt/sounds/187290/"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -65  - button.p.h,
			size: 18,
			color: "white",
			label: "Game Over screen: http://www.freesound.org/people/Headphaze/sounds/234514/"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -40  - button.p.h,
			size: 18,
			color: "white",
			label: "Game Over: http://www.freesound.org/people/landlucky/sounds/277403/"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: -15 - button.p.h,
			size: 18,
			color: "white",
			label: "Explosión: http://www.freesound.org/people/Omar%20Alvarado/sounds/199725/"
		}));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: 10  - button.p.h,
			size: 18,
			color: "white",
			label: "Kunai: http://www.freesound.org/people/LiamG_SFX/sounds/334238/"
		}));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: 35  - button.p.h,
			size: 18,
			color: "white",
			label: "Coin1: http://www.freesound.org/people/FenrirFangs/sounds/213985/"
		}));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: 60  - button.p.h,
			size: 18,
			color: "white",
			label: "Coin2: http://www.freesound.org/people/D%20W/sounds/140382/"
		}));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: 85  - button.p.h,
			size: 18,
			color: "white",
			label: "Coin3: http://www.freesound.org/people/ThatNinjaGuy/sounds/195779/"
		}));
		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: 110  - button.p.h,
			size: 18,
			color: "white",
			label: "Win1: http://www.freesound.org/people/Envywolf/sounds/392762/"
		}));

		var label = container.insert(new Q.UI.Text({
			x: 0,
			y: 135  - button.p.h,
			size: 18,
			color: "white",
			label: "Win2: http://www.freesound.org/people/Tuudurt/sounds/275104/"
		}));

		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('startMenu');
		});

		container.fit(20);
	});

	// Escenario para el HUD.
	Q.scene("HUD", function(stage) {
		var life_icon = stage.insert(new Q.UI.Button({
			x:30,
			y:35,
			asset: 'heart_HUD.png'
		}));
		var life = stage.insert(new Q.UI.Text({
			x: 80,
			y: 10,
			size: 30,
			outlineWidth: 1,
			label: "500",
			color: "red"
		}));
		
		Q.state.on("change.life", this, function() {
			var coinstr = "" + Q.state.p.life;
			life.p.label = coinstr;
		});

		var coin_icon = stage.insert(new Q.UI.Button({
			x:30,
			y:80,
			asset: 'coin_HUD.png'
		}));
		var coin = stage.insert(new Q.UI.Text({
			x: 80,
			y: 55,
			size: 30,
			outlineWidth: 1,
			label: "0",
			color: "yellow"
		}));
		
		Q.state.on("change.coin", this, function() {
			var coinstr = "" + Q.state.p.coin;
			coin.p.label = coinstr;
		});
	});

	Q.loadTMX("level.tmx, level2.tmx, ninja.png, ninja.json, wind.png, wind.json, fan.png, fan.json, acid.png, acid.json, enemy_ninja.png, enemy_ninja.json, enemy_robot.png, enemy_robot.json, food.png, food.json, robot_missile.png, robot_missile.png, robot_missile.json, explosion.png, explosion.json, kunai.png, kunai.json, coin.png, coin.json, coin_HUD.png, heart_HUD.png, bowser.png, bowser.json, master.png, master.json", function() {
		Q.compileSheets("ninja.png", "ninja.json");
		Q.compileSheets("wind.png", "wind.json");
		Q.compileSheets("fan.png", "fan.json");
		Q.compileSheets("acid.png", "acid.json");
		Q.compileSheets("enemy_ninja.png", "enemy_ninja.json");
		Q.compileSheets("enemy_robot.png", "enemy_robot.json");
		Q.compileSheets("food.png", "food.json");
		Q.compileSheets("robot_missile.png", "robot_missile.json");
		Q.compileSheets("explosion.png", "explosion.json");
		Q.compileSheets("kunai.png", "kunai.json");
		Q.compileSheets("coin.png", "coin.json");
		Q.compileSheets("bowser.png", "bowser.json");
		Q.compileSheets("master.png", "master.json");
		Q.load({
			"music_main"       : "music_main.mp3",
			"sword_attack"     : "sword_attack.mp3",
			"food_eat"         : "eat.mp3",
			"woman_scream"     : "woman_scream.mp3",
			"robot_noise"      : "robot.mp3",
			"game_over"	       : "game_over.mp3",
			"game_over_screen" : "game_over_screen.mp3",
			"explosion"		   : "explosion.mp3",
			"kunai_noise"      : "kunai.mp3",
			"coin_catched"	   : "coin_catched.mp3",
			"win_game"		   : "win.mp3",
			"monster_die"	   : "monster_die.mp3"
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

				throw_left		  : {frames: [160, 161, 162, 163, 164, 165, 166, 167, 168, 169], rate: 1/10, loop: false, trigger: "throwKunai"},
				throw_right	      : {frames: [170, 171, 172, 173, 174, 175, 176, 177, 178, 179], rate: 1/10, loop: false, trigger: "throwKunai"}
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

			Q.animations("enemy_robot_anim", {
				stand_left    : {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], rate: 1/3, loop: true},
				stand_right   : {frames: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], rate: 1/3, loop: true},

				run_left      : {frames: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29], rate: 1/10, loop: true},
				run_right     : {frames: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39], rate: 1/10, loop: true},

				jump_left     : {frames: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49], rate: 1/10, loop: false},
				jump_right    : {frames: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59], rate: 1/10, loop: false},

				fall_left	  : {frames: [49], loop: false},
				fall_right    : {frames: [59], loop: false},

				attack_left   : {frames: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69], rate: 1/10, loop: false, trigger: "EnemyAttacked"},
				attack_right  : {frames: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79], rate: 1/10, loop: false, trigger: "EnemyAttacked"},

				die_left      : {frames: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89], rate: 1/10, loop: false, trigger: "EnemyDie"},
				die_right     : {frames: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99], rate: 1/10, loop: false, trigger: "EnemyDie"},

				missile_left  : {frames: [100, 101, 102, 103, 104, 105, 106, 107, 108, 109], rate: 1/10, loop: false, trigger: "EnemyShooted"},
				missile_right : {frames: [110, 111, 112, 113, 114, 115, 116, 117, 118, 119], rate: 1/10, loop: false, trigger: "EnemyShooted"},
			});

			Q.animations("missile_anim", {
				missile_left  : {frames: [0, 1, 2, 3, 4], rate: 1/5, loop: true},
				missile_right : {frames: [5, 6, 7, 8, 9], rate: 1/5, loop: true}
			});

			Q.animations("explosion_anim", {
				explosion_animation : {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], rate: 1/16, loop: false, trigger: "MissileImpact"}
			});

			Q.animations("kunai_anim", {
				kunai_right : {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8], rate: 1/18, loop: true},
				kunai_left  : {frames: [9, 10, 11, 12, 13, 14, 15, 16, 17], rate: 1/9, loop: true}
			});

			Q.animations("boss_anim", {
				boss_right : {frames: [0, 1, 2, 3], rate: 1/2, loop: true},
				boss_left  : {frames: [4, 5, 6, 7], rate: 1/2, loop: true}
			});

			Q.animations("coin_anim", {
				coin_animation : {frames: [0, 1, 2, 3, 4, 5, 6], rate: 1/7, loop: true}
			});

			Q.stageScene("startMenu", 0);
			//Q.stageScene("startMenu", 0);
		});
	});
});
