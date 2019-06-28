/******************************************* */
/* Modulo que controla el juego de caramelos */
/******************************************* */

const MAX_COL = 7;
const MAX_ROW = 7;

var caramelos   = [];
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

// funcion sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// llenamos con todos los caramelos
async function llenarCaramelos(){

    // limpiamos los caramelos existentes
    $("div[class*='col-']").empty();
    let positionTablero = $(".panel-tablero").position();

    caramelos  = [];
    let curCol, objCol;
    for(let row=0; row < MAX_ROW; ++row){
        caramelos[row] = [];
        for(let col=0; col < MAX_COL; ++col){
            let num = Math.floor(Math.random() * (4 - 1)) + 1; // obtiene un número aleatorio del 1 al 4
            let obj = {data: num, row, col, selCol:false, selRow:false};

            curCol = '.col-' + (col+1);
            objCol = $(curCol);
            // añade el html y la imagen correspondiente
            objCol.prepend("<div>" +
                                 "<img class='caramelo' src='image/"+ num +".png' data='"+num+"' row='"+row+"' col='"+col+"'/>"+
                           "</div>");

            obj.img = $(objCol.find("img[row='"+row+"'][col='"+col+"']")); // obtiene la imagen insertada
            caramelos[row][col] =  obj; // coloca en la matriz el objeto correspondiente
        }

        await sleep(200);
    }

    chequearCaramelosConsecutivos(); // realiza el chequeo de caramelos consecutivos
};

function rellenarFaltantes(){

}

// cheuque si existen caramelos consecutivos (tres o mas) de ser
// el caso otorga una puntuacion al jugador por cada caramelo encontrado
async function chequearCaramelosConsecutivos(){
    let lastImg, curImg, enImg, cont, init;
    let enCaramelos = []; // caramelos encontrados consecutivos

    // CHEQUEO POR REGISTRO
    // buscamos las concidencias de caramelos mas de tres
    for(let row=0; row < MAX_ROW; ++row){
        for(let col=0; col < MAX_COL; ++col){
            curImg  = caramelos[row][col];

            if(col == 0) { // si la columna es cero, inicializa las varibles
                cont = 0;
                init = col;
                continue;
            }
            lastImg = caramelos[row][col-1];

            if(lastImg.data == curImg.data){ // si tienen la misma imagen(data)
                ++cont;
            }else{
                cont  = 0;
                init = col;
            }

            if(cont >= 2){ // marcamos a quienes deben ser eliminados y puntuados
                for(let i = init; i <= col; ++i){ // colocamos en los caramelos encontrados
                    enImg = caramelos[row][i];
                    if(enCaramelos.find( o => o.row == enImg.row && o.col == enImg.col) == undefined){
                        enCaramelos.push({ row: enImg.row, col: enImg.col, obj: enImg});
                    }
                }
            }
        }
    }


    // CHEQUEO POR COLUMNA
    // buscamos las concidencias de caramelos mas de tres
    for(let col=0; col < MAX_COL; ++col){
        for(let row=0; row < MAX_COL; ++row){
            curImg  = caramelos[row][col];

            if(row == 0) { // si la columna es cero, inicializa las varibles
                cont = 0;
                init = row;
                continue;
            }
            lastImg = caramelos[row-1][col];

            if(lastImg.data == curImg.data){ // si tienen la misma imagen(data)
                ++cont;
            }else{
                cont  = 0;
                init = row;
            }

            if(cont >= 2){ // marcamos a quienes deben ser eliminados y puntuados
                for(let i = init; i <= row; ++i){ // colocamos en los caramelos encontrados
                    enImg = caramelos[i][col];
                    if(enCaramelos.find( o => o.row == enImg.row && o.col == enImg.col) == undefined){
                        enCaramelos.push({ row: enImg.row, col: enImg.col, obj: enImg});
                    }
                }
            }
        }
    }

    await sleep(200);

    // si encontro caramelos modifica la puntuacion
    if(enCaramelos.length > 0){
        puntuacion += (enCaramelos.length) * 100;

        // elimina los caramelos encontrados como consecutivos
        enCaramelos.forEach ( o => {
            o.obj.img.attr("src", "");// elimina los caramelos
        })

        $('#score-text').text(puntuacion);
    }
}


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
            mostrarFinalResultados();
            return;
        }

        $('#timer').text('0' + min + ":" + ( sec > 9 ? sec : ('0' + sec)));

    }, 1000);
}

// funcion que muestra los resultados
function mostrarFinalResultados(){

}


// funcion document
$(function(){

    // realiza el cambio de color del titulo
    cambiaColorTitulo();

    // boton click en inicio
    $(".btn-reinicio").on("click", function() {
           iniciar();
    });
});