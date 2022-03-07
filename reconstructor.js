//El reconstructor funciona sumando funciones sync desfasadas y escaladas
//El escalado de cada sync se hace con los puntos discretos correspondientes
//El reconstructor sincroniza los generadores y muestrea la entrada libre
class Reconstructor {

	constructor(generatriz, numGeneradores, densidad) {

		this.generatriz = generatriz; //función en forma string
		
		//Inicializar reconstruccion con 0s para que los generadores no lean NaN
		this.reconstruccion = [];
		for (let i = 0; i <= numGeneradores*densidad; i++) {

			console.log(i);
			this.reconstruccion[i] = 0.0;

		}

		this.numGeneradores = numGeneradores;
		this.generadores = [2*numGeneradores];	//Lista de generadores
		this.indiceCilindrico = 0;	//Los generadores son reutilizados cuando se muestrean nuevos valores
		for(let i = 0; i < 2*numGeneradores; i++) {

			this.generadores[i] = new Generador(this);

		}

		this.entrada = 0.0;
		this.puntosDiscretos = []; //Historial de puntos discretos que se enviará a los generadores.
		this.densidad = densidad;
		this.contadorMuestreo = 0;	//Contador interno para muestrear entrada cuando se alcanza valor de densidad

		this.pasoDenso = 1/densidad; //resolucion de la reconstruccion
		this.subPaso = 0.0;	//Tiempo de sumilación sobrante entre pasos densos
		
		//Esta Sync pasará por 0 cuando se evalue en valores enteros de x
		this.generatriz = new Sync(this.pasoDenso, Math.ceil(numGeneradores/2));

	}

	//Calcular la reconstrucción continua (paso denso)
	paso(incrementoX) {

		//Reutilizar el tiempo denso sobrante de la última ejecución
		this.subPaso += incrementoX;

		//Simular hasta tiempo presente
		while (this.subPaso >= this.pasoDenso) {

			//Muestrear
			this.contadorMuestreo++;
			this.contadorMuestreo %= this.densidad;

			//TODO los generadores son reiniciados en x=0 esto genera picos
			if(this.contadorMuestreo == 0) {

				//Guardar este valor en el historial
				this.puntosDiscretos.push(this.entrada);

				//Hacer objetivo al generador más antiguo
				this.indiceCilindrico++;
				this.indiceCilindrico %= this.numGeneradores * 2;

				//Y asignarle nuevo punto muestreado
				this.generadores[this.indiceCilindrico].nuevo(this.puntosDiscretos[this.puntosDiscretos.length - 1]);

			}

			//Cada generador avanza un paso denso y suma su valor generado
			for (let i = 0; i < this.numGeneradores*2; i++) {

				this.generadores[i].pasoDenso();

			}

			//Avanzar la reconstruccion un paso denso, los generadores editarán este punto a lo largo de la simulación.
			this.reconstruccion.push(0);

			this.subPaso -= this.pasoDenso;

		}

	}
	
}

//Los generadores editan valores anteriores de la reconstrucción para hacerlos coincidir con el punto muestreado sin percibir desfase en la visualización
class Generador {

	constructor(reconstructorAsociado) {

		this.reconstructorAsociado = reconstructorAsociado;

		//El desfase de reconstrucción es constante, cada generador actuará sobre cierto valor dependiendo de en qué orden los llame el reconstructor.

		this.desfaseReconstruccion = this.reconstructorAsociado.numGeneradores * this.reconstructorAsociado.densidad;

		this.posicionN = -this.reconstructorAsociado.numGeneradores * this.reconstructorAsociado.densidad;
		this.puntoDiscreto = 0.0;

	}

	nuevo(puntoDiscreto) {

		//El desfase de reconstrucción es constante, cada generador actuará sobre cierto valor dependiendo de en qué orden los llame el reconstructor.
		this.desfaseReconstruccion = this.reconstructorAsociado.numGeneradores * this.reconstructorAsociado.densidad;

		this.posicionN = -this.reconstructorAsociado.numGeneradores * this.reconstructorAsociado.densidad;

		//El reconstructor le asigna el valor muestreado
		this.puntoDiscreto = puntoDiscreto;

	}

	pasoDenso() {

		this.posicionN++;

		//Editar punto de la reconstrucción de forma aditiva
		this.reconstructorAsociado.reconstruccion[this.desfaseReconstruccion] += this.puntoDiscreto * this.reconstructorAsociado.generatriz.evaluaN(this.posicionN);

		//DEBUG
		//console.log(this.reconstructorAsociado.reconstruccion[this.desfaseReconstruccion]);

	}

}

class Wave {

	constructor(funcionString, pasoDenso, longitudX) {

		this.wave = Function("x", "return " + funcionString + ";");	//Evaluar funcionString como una función generadora con variable indep "x"

		this.pasoDenso = pasoDenso;  //Incremento mínimo para generar puntos
		this.longitudX = longitudX;

		//Generar colección de puntos
		this.nPuntos = Math.ceil(longitudX/pasoDenso);
		this.puntos = [this.nPuntos];

		for (let i = 0; i < this.nPuntos; i++) {

			this.puntos[i] = this.wave(i * pasoDenso);

		}

	}

	regenerar() {

		//Regenerar colección de puntos
		this.wave = Function("x", "return " + funcionString + ";");

		this.nPuntos = Math.ceil(longitudX/pasoDenso);
		this.puntos = [nPuntos];

		for (let i = 0; i < this.nPuntos; i++) {

			this.puntos[i] = this.wave(i * pasoDenso);

		}

	}

	evaluaX(x) {

		return this.puntos[Math.round(x/this.pasoDenso)];

	}

	evaluaN(n) {

		return this.puntos[n % this.nPuntos];

	}
 
}

//La función sync es útil si se define de forma simétrica PAR
//Por lo que se reutilizará el lookup para valores de x negativos
class Sync extends Wave {

	constructor(pasoDenso, longitudX) {

		super("sin(PI*x)/(PI*x)", pasoDenso, longitudX);

		//Regenerar punto en x = 0, resolviendo la indeterminacion
		this.puntos[0] = 1; //Sync evaluada en el límite cercano a x +-0

	}

	regenerar() {

		//Regenerar colección de puntos
		this.wave = Function("x", "return " + "sin(PI*x)/(PI*x)" + ";");

		this.nPuntos = Math.ceil(longitudX/pasoDenso);
		this.puntos = [nPuntos];

		this.puntos[0] = 1; //Sync evaluada en el límite cercano a x +-0
		for (let i = 1; i < this.nPuntos; i++) {

			this.puntos[i] = this.wave(i * pasoDenso);

		}

	}

	//TODO El módulo está mal implementado evaluaN funciona mejor
	evaluaX(x) {

		//Reutilizar valores positivos para la parte negativa y
		//acondicionar valores dentro del rango x
		x = abs(x) % this.longitudX;

		return this.puntos[Math.round(x/this.pasoDenso)];

	}

	evaluaN(n) {

		n = min(abs(n), this.puntos.length - 1);

		return this.puntos[n];

	}

}