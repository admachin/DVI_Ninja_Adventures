## Diseño de la implementación

* Para la realizacion de Ninja Adventures se ha hecho uso del motor Quintus el cual ha sido modificado para incluir las caracteristicas de salto doble, planear y deslizarse del personaje principal.

* El comportamiento del personaje principal esta definido en "Ninja". Este puede correr, saltar, realizar dobles saltos, planear, deslizarse por el suelo, atacar con la espada y lanzar kunais.

* Se ha creado un componente llamado defaultEnemy que incorpora las colisiones comunes a todos los enemigos, al hacer esto se reduce el codigo repetido en las funciones que implementan el comportamiento de los enemigos, que son dos, "EnemyNinja", y "EnemyRobot".

* "EnemyNinja" incorpora el comportamiento del enemigo ninja, este comportamiento consiste en desplazarse por el escenario y en caso de encontrarse con el protagonista, atacarle en la direccion en la que su sprite colisiona con el del protagonista.

* El comportamiento de "EnemyRobot" es similar al de "EnemyNinja" pero este ademas realiza disparos de bolas de fuego para herir al protagonista.

* "Fan" implementa el sprite del ventilador.

* "Wind" implementa un sprite sin sheet que hace que el ninja vuele cuando lo toca.

* "RobotMissile" define los proyectiles que lanza "EnemyRobot" al disparar.

* "NinjaKunai" define los proyectiles que lanza "Ninja", el personaje principal.

* "Master" es el sensor que provoca que el jugador gane la partida al ser tocado. Es el objetivo a alcanzar.

* "Acid" es un elemento del escenario que al ser tocado provoca la muerte instantanea del jugador.

* "Food" permite recuperar puntos de vida al jugador al tocarlo, tras hacerlo "Food" desaparece. Los puntos de vida que recupera vienen definidos en el parametro healPower: 300.

* "Coin" son las monedas que puede recoger y que aumentan la puntuacion final. Tras ser recogidas, desparecen.

* "level1" implementa el nivel en el que se juega y las caracteristicas de este, como son el reparto de items y enemigos por las distintas partes del mapeado.

* "startMenu" contiene el menu principal del juego, este contiene botones para empezar a jugar y ver informacion del desarrollo del mismo como los desarrolladores (implementado en "Desarrolladores"), controles del juego (implementado en "Controles"), y las principales fuentes que se han utilizado para el desarrollo del juego (implementadas en "Fuentes" y "Fuentes2").

* "loseGame" implementa la pantalla de partida perdida y "winGame" la pantalla de partida ganada.

* En "HUD" estan definidos los distintos elementos del HUD del juego como la vida restante y los puntos del jugador.

* Las distintas animaciones estan definidas en "wind_anim", "fan_anim", "acid_anim", "ninja_anim", "enemy_ninja_anim", "enemy_robot_anim", "missile_anim", "explosion_anim", "kunai_anim" y "coin_anim".

#### [Volver al indice](README.md)  
