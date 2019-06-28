

var movimientos = 0;
var puntuacion  = 0;
var timerColorTitulo, timerReloj;

// iniciliza el juego
function iniciar(){
    puntuacion  = 0;
    movimientos = 0;

    // inicializamos los textos
    $(".btn-reinicio").text("Reiniciar");
    $('#score-text').text(puntuacion);
    $('#movimientos-text').text(movimientos);

    // llenamos de caramelos
    llenarCaramelos();

    // iniciamos el reloj
    iniciaReloj();
}

// llenamos con todos los caramelos
function llenarCaramelos(){

    // limpiamos los caramelos existentes
    $("div[class*='col-']").empty();
};

// cambia el titulo constantemente
function cambiaColorTitulo(){
    let cambiarTitulo = 0;

    if(timerColorTitulo){
        clearInterval(timerColorTitulo);
    }

    setInterval( () => {
        if(cambiarTitulo == 0){
            cambiarTitulo = 1;
            $('.main-titulo').css('color', '');
        }else{
            cambiarTitulo = 0;
            $('.main-titulo').css('color', 'blue');
        }
    }, 500);
}

// funcion que inicia el decremento del reloj
function iniciaReloj(){
    var dt = new Date("December 30, 2019 00:02:00");

    $('#timer').text('02:00');

    if(timerReloj){
        clearInterval(timerReloj);
    }

    timerReloj = setInterval( () => {
        dt.setSeconds( dt.getSeconds() - 1 );

        let sec =  dt.getSeconds();
        let min =  dt.getMinutes();

        if(min == 0 && sec == 0){
            clearInterval(timerReloj);
            mostrarResultados();
            return;
        }

        $('#timer').text('0' + min + ":" + ( sec > 9 ? sec : ('0' + sec)));

    }, 1000);
}

// funcion que muestra los resultados
function mostrarResultados(){

}


// funcion document
$(function(){

    cambiaColorTitulo();

    // boton click en inicio
    $(".btn-reinicio").on("click", function() {
           iniciar();
    });
});