function preload() {}

function setup() {
	
	reconstructor = new Reconstructor("sin(PI*x)/(PI*x)", 7, 100);
	interfaz = new Interfaz_Reconstructor(reconstructor, 0, 0, windowWidth, windowHeight);
  
}

function draw() {
	
	//background(255);

	reconstructor.paso(deltaTime * 0.001);	//p5 guarda el tiempo entre frames en deltaTime. El método paso recibe el incrementoX en segundos

	interfaz.draw();

	//Limitar tamaño de reconstruccion
	if (reconstructor.reconstruccion.length > (reconstructor.numGeneradores * reconstructor.densidad)) {

		reconstructor.reconstruccion.splice(0, reconstructor.reconstruccion.length - (reconstructor.numGeneradores * reconstructor.densidad));

	}

	//TEMP
	/* interfaz.reconstructor.reconstruccion.push(interfaz.valorDeslizador);
	 */
	
}

function mousePressed() {

	interfaz.eventoDeslizador(1);

}

function mouseReleased() {

	interfaz.eventoDeslizador(0);

}

function mouseMoved() {}

function windowResized() {
	
	resizeCanvas(windowWidth, windowHeight);
	interfaz.resize(0, 0, windowWidth, windowHeight);
	
}