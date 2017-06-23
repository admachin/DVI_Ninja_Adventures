## Diseño de la implementación

* Para la realizacion de Ninja Adventures se ha hecho uso del motor Quintus el cual ha sido modificado para incluir las caracteristicas de salto doble, planear y deslizarse del personaje principal.

* El comportamiento del personaje principal esta definido en "Ninja". Este puede correr, saltar, realizar dobles saltos, planear, deslizarse por el suelo, atacar con la espada y lanzar kunais.

* Se ha creado un componente llamado defaultEnemy que incorpora las colisiones comunes a todos los enemigos, al hacer esto se reduce el codigo repetido en las funciones que implementan el comportamiento de los enemigos, que son tres, "EnemyNinja", "EnemyRobot" y "Boss".

* "EnemyNinja" incorpora el comportamiento del enemigo ninja, este comportamiento consiste en desplazarse por el escenario y en caso de encontrarse con el protagonista, atacarle en la direccion en la que su sprite colisiona con el del protagonista.

* El comportamiento de "EnemyRobot" es similar al de "EnemyNinja" pero este ademas realiza disparos de bolas de fuego para herir al protagonista.

* El "Boss" define el enemigo a vencer al final del primer nivel y está basado al igual que el resto de enemgos en el componente "defaultEnemy".

* "Fan" implementa la base de los ventiladores con los que el usuario si realiza colisiones.

* "Wind" en cambio representa el viento que empuja el ventilador al moverse. Esta programado de tal forma que al detectar la colisión con el jugador realiza los cálculos inversos a los que realiza Quintus para resolverla por lo que el usuario es capaz de entrar dentro de este objeto. Cuando el usuario se encuentra dentro de "Wind" si pulsa el botón espacio puede elevarse usando la capa del ninja.

* "RobotMissile" define los proyectiles que lanza "EnemyRobot" al disparar.

* "NinjaKunai" define los proyectiles que lanza "Ninja", el personaje principal.

* "Master" es el sensor que provoca que el jugador gane la partida al ser tocado. Es el objetivo a alcanzar.

* "Acid" es un elemento del escenario que al ser tocado provoca la muerte instantanea del jugador.

* "Food" permite recuperar puntos de vida al jugador al tocarlo, tras hacerlo "Food" desaparece. Los puntos de vida que recupera vienen definidos en el parametro healPower que puede ser modificado según se quiera al igual que el sprite para que tenga diferentes apariencias.

* "Coin" son las monedas que puede recoger y que aumentan la puntuacion final. Tras ser recogidas, desparecen.

* "level1" implementa el nivel en el que se juega y las caracteristicas de este, como son el reparto de items y enemigos por las distintas partes del mapeado. Al terminarlo hay un menú que permite pasar al siguiente nivel.

* "level2" implementa el nivel en el que se juega y las caracteristicas de este, como son el reparto de items y enemigos por las distintas partes del mapeado. Al final de éste se encuentra el Maestro que finaliza el juego.

* "startMenu" contiene el menu principal del juego, este contiene botones para empezar a jugar y ver informacion del desarrollo del mismo como los desarrolladores (implementado en "Desarrolladores"), controles del juego (implementado en "Controles"), y las principales fuentes que se han utilizado para el desarrollo del juego (implementadas en "Fuentes" y "Fuentes2").

* "loseGame" implementa la pantalla de partida perdida y "winGame" la pantalla de partida ganada.

* "nextLevel" es una pantalla que aparece al vencer al Boss del primer nivel y que permite pasar al segundo nivel.

* En "HUD" estan definidos los distintos elementos del HUD del juego como la vida restante y los puntos del jugador.

* Las distintas animaciones estan definidas en "wind_anim", "fan_anim", "acid_anim", "ninja_anim", "enemy_ninja_anim", "enemy_robot_anim", "missile_anim", "explosion_anim", "kunai_anim" y "coin_anim".

#### [Volver al indice](README.md)  
