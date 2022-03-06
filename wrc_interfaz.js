class Interfaz_Reconstructor {

    constructor(reconstructor, posicionX, posicionY, ancho, largo) {

        createCanvas(ancho, largo);

        //Configuración
        this.amplitudOnda = 1;

        this.reconstructor = reconstructor;
        this.posicionX = posicionX;
        this.posicionY = posicionY;
        this.ancho = ancho;
        this.largo = largo;
        this.deslizadorActivo = 0;
        this.valorDeslizador = 0;

    }

    eventoDeslizador(modo) {

        switch(modo) {

            //Comprobar si el ratón está en zona de deslizador y activarlo
            case 1:
                

                if(winMouseX > this.posicionX + this.ancho - 30
                    && winMouseY < this.posicionY + this.largo/2) {
                    this.deslizadorActivo = 1;

                    this.valorDeslizador = map(winMouseY,
                        this.posicionY,
                        this.posicionY + this.largo/2,
                        -this.amplitudOnda,
                        this.amplitudOnda);
                }

                break;

            //Desactivar el deslizador si se suelta el botón
            case 0:

                this.deslizadorActivo = 0;

                break;

            default:
                break;

        }

    }

    draw() {

        let xDraw = 0.0;
        let yDraw = 0.0;

        //Limpiar fondo
        noStroke();
        fill(100);
        rect(this.posicionX, this.posicionY, this.ancho, this.largo/2); 

        //Dibujar reconstruccion
        stroke(color(50, 0, 100));
        fill(color(50, 0, 100));
        strokeWeight(1);
        beginShape();
        for (let i = this.reconstructor.reconstruccion.length -1; i >= 0; i--) {

            xDraw = map(i, 
                        0, 
                        this.reconstructor.reconstruccion.length - 1,
                        this.posicionX,
                        this.posicionX + this.ancho - 30);

            yDraw = map(this.reconstructor.reconstruccion[i],
                        -this.amplitudOnda,
                        this.amplitudOnda,
                        this.posicionY,
                        this.posicionY + this.largo/2);

            vertex(xDraw, yDraw);

        }
        vertex(this.posicionX, this.posicionY + this.largo*1/4);
        vertex(this.posicionX + this.ancho - 30, this.posicionY + this.largo*1/4);
        endShape(CLOSE);

        

        //Actualizar y dibujar deslizador
        this.reconstructor.entrada = this.valorDeslizador;
        if (this.deslizadorActivo) {
            this.valorDeslizador = map(winMouseY,
                                      this.posicionY,
                                      this.posicionY + this.largo/2,
                                      -this.amplitudOnda,
                                      this.amplitudOnda,
                                      1);
        }
        fill(80);
        noStroke();
        rect(this.posicionX + this.ancho - 30, 
            0,
            30, 
            this.largo/2);

        fill(30);
        rect(this.posicionX + this.ancho - 30, 
            map(this.valorDeslizador, -this.amplitudOnda, this.amplitudOnda, this.posicionY - 5, this.posicionY + this.largo/2 - 5),
            30, 
            10);

        //Limpiar fondo
        noStroke();
        fill(150);
        rect(this.posicionX, 
            this.posicionY + this.largo/2, 
            this.ancho, 
            this.largo/2); 

        //Dibujar generatriz
        stroke(color(50, 0, 100));
        fill(color(50, 0, 100));
        strokeWeight(1);
        beginShape();
        for (let i = -(this.reconstructor.generatriz.puntos.length - 1); i < this.reconstructor.generatriz.puntos.length; i++) {

            xDraw = map(i, 
                        -(this.reconstructor.generatriz.puntos.length - 1), 
                        this.reconstructor.generatriz.puntos.length - 1,
                        this.posicionX,
                        this.posicionX + this.ancho);

            yDraw = map(this.reconstructor.generatriz.puntos[abs(i)],
                        -this.amplitudOnda,
                        this.amplitudOnda,
                        this.posicionY + this.largo - 10,
                        this.posicionY + this.largo/2 + 10);

            vertex(xDraw, yDraw);

        }

        vertex(this.posicionX + this.ancho, this.posicionY + this.largo*3/4);
        vertex(this.posicionX, this.posicionY + this.largo*3/4);

        endShape(CLOSE);

        //TODO Dibujar puntos discretos
        fill(255);
        noStroke();
        let incrementoX = this.ancho/this.reconstructor.reconstruccion.length * 50;
        let offset = this.reconstructor.contadorMuestreo * 2;
        for (let i = 0; i < this.reconstructor.puntosDiscretos.length - 1; i++) {

            if (-offset + this.posicionX + this.ancho - incrementoX*i < 0) {break;}

            //rect(-offset + this.posicionX + this.ancho - incrementoX*i, this.posicionY + 10 * i, 20, 20);

        }

    }

    //Actualizar posición y dimensiones
    resize(posicionX, posicionY, ancho, largo) {

        this.posicionX = posicionX;
        this.posicionY = posicionY;
        this.ancho = ancho;
        this.largo = largo;

    }

}