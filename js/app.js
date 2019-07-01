/******************************************* */
/* Modulo que controla el juego de caramelos */
/******************************************* */
const MAX_COL = 7;
const MAX_ROW = 7;

var caramelos   = [];
var movimientos = 0;
var puntuacion  = 0;
var chequeandoCaramelos = false;
var timerColorTitulo, timerReloj;

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

        if(min == 1 && sec == 0){
            clearInterval(timerReloj);
            mostrarFinalResultados();
            return;
        }

        $('#timer').text('0' + min + ":" + ( sec > 9 ? sec : ('0' + sec)));

    }, 1000);
}

// inicializa el juego
function iniciarJuego(){
    puntuacion  = 0;
    movimientos = 0;

    // inicializamos los textos
    $(".btn-reinicio").text("Reiniciar");
    $('#score-text').text(puntuacion);
    $('#movimientos-text').text(movimientos);

    $('.panel-tablero').show();
    $('.score, .moves, .time').css("width","");

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
    let posImg;

    caramelos  = [];
    let curCol, objCol;
    for(let row=0; row < MAX_ROW; ++row){
        caramelos[row] = [];
        for(let col=0; col < MAX_COL; ++col){
            let num = Math.floor(Math.random() * (4 - 1)) + 1; // obtiene un número aleatorio del 1 al 4
            let obj = {data: num, row, col};

            curCol = '.col-' + (col+1);
            objCol = $(curCol);
            // añade el html y la imagen correspondiente
            objCol.prepend("<div class='contenedorCaramelo' row='"+row+"' col='"+col+"'>" +
                                 "<img class='caramelo' src='image/"+ num +".png' data='"+num+"' row='"+row+"' col='"+col+"'/>"+
                           "</div>");

            obj.img = $(objCol.find("img[row='"+row+"'][col='"+col+"']")); // obtiene la imagen insertada
            caramelos[row][col] =  obj; // coloca en la matriz el objeto correspondiente

            efectoCaidaCaramelos(obj.img, row); // efecto de caida de caramelos
        }

        await sleep(220);
    }

    efectoDraggable(); // coloca el efecto para que se muevan las imagenes

    chequearCaramelosConsecutivos(true); // realiza el chequeo de caramelos consecutivos
};

// cheuque si existen caramelos consecutivos (tres o mas) de ser
// el caso otorga una puntuacion al jugador por cada caramelo encontrado
async function chequearCaramelosConsecutivos(prenderChequeo){
    let lastImg, curImg, enImg, cont, init;
    let enCaramelos = []; // caramelos encontrados consecutivos
    if(prenderChequeo) chequeandoCaramelos = true;

    // CHEQUEO POR REGISTRO
    // buscamos las coincidencias de caramelos(mas de tres)
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
    // buscamos las concidencias de caramelos (mas de tres)
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

    await sleep(300);

    // si encontro caramelos modifica la puntuacion
    if(enCaramelos.length > 0){
        puntuacion += (enCaramelos.length); // añade 1 punto por cada caramelo eliminado

        // realizamos la animacion de las imagenes a eliminarse
        enCaramelos.forEach ( o => {
            o.obj.img.hide(350, 'swing', function () {
              $(this).show(325, 'swing', function () {
                $(this).hide(325, 'swing', function () {
                    $(this).show(325, 'swing', function () {
                        $(this).toggle( "explode" );
                    });
                });
              });
            });
        })

        await sleep(2000);

        // elimina los caramelos encontrados como consecutivos
        await enCaramelos.forEach ( o => {
            o.obj.img.css("display", "");
            actualizaImagen(o.obj, 0); // elimina los caramelos
        })

        $('#score-text').text(puntuacion); // coloca la actual puntuacion

        await rellenarFaltantes(); // rellenamos los caramelos faltantes
    }
    if(prenderChequeo) chequeandoCaramelos = false;
}

// realizamos el rellenado de los caramelos
async function rellenarFaltantes(){
    let curImg, enImg, hasImg;

    // rellenamos los espacios en blanco de las columnas
    // con los caramelos existentes actualmente
    for(let col=0; col < MAX_COL; ++col){
        for(let row=0; row < MAX_COL; ++row){
            curImg = caramelos[row][col];
            if(curImg.data == 0){ // busca si encima tiene alguno que tenga imagen
                for(let enRow=row+1; enRow < MAX_COL; ++enRow){
                    enImg = caramelos[enRow][col];
                    if(enImg.data != 0){
                        actualizaImagen(curImg, enImg.data); // coloca los datos de la imagen buscada
                        actualizaImagen(enImg, 0);           // vacia la imagen encontrada
                        break;
                    }
                }
            }
        }
    }

    // rellenamos con nuevos caramelos los espacios en blanco
    for(let row=0; row < MAX_ROW; ++row){
        hasImg = false;
        for(let col=0; col < MAX_COL; ++col){
            curImg = caramelos[row][col];

            if(curImg.data == 0){ // busca si encima tiene alguno que tenga imagen
                let num = Math.floor(Math.random() * (4 - 1)) + 1; // obtiene un número aleatorio del 1 al 4
                actualizaImagen(curImg, num); // coloca los datos de la imagen nueva
                hasImg = true;

                efectoCaidaCaramelos(curImg.img, row); // efecto caida de caramelos
            }
        }
        if(hasImg){
            await sleep(220);
        }
    }

    await chequearCaramelosConsecutivos(false); // realiza nuevamente el chequeo de caramelos consecutivos
}

// funcion que simula la caida de caramelos
function efectoCaidaCaramelos(img, row){
    let posIniTop = ( img[0].offsetHeight * (MAX_ROW - row) - 30 ); // obtiene la posicion inicial desde donde la imagen caerá
    posImg  = img.position();

    img.offset ({top: posImg.top - posIniTop});

    img.animate( // realiza la animacion de caida de caramelos
        {
            top:  "+="+posIniTop,
        },{
            duration: 200,
            queue : false
        }
    );
}

// funcion que captura el efecto de draggable
function efectoDraggable(){
    $('.caramelo').draggable({
        stop: function() {
            // si ha parado el drag verifica que su posicion sea la deseada
            // caso contrario retorna a su posicion de origen
            setTimeout( () => {
                let top  = $(this).css("top");
                let left = $(this).css("left");
                if(top != '0px' || left != '0px'){
                    ubicarImagenPosicionInicial($(this));
                }
            }, 50);
        }
    });
    $( ".contenedorCaramelo" ).droppable({
        drop: function( event, ui ) {
          let rowCont = $(this).attr('row');
          let colCont = $(this).attr('col');
          let rowImg  = $(ui.draggable).attr('row');
          let colImg  = $(ui.draggable).attr('col');
          let objImg  = caramelos[rowImg][colImg];
          let objCont = caramelos[rowCont][colCont];
          let dataImg = objImg.data;
          let dataCont = objCont.data;
          let moveOnePosition = false;

          if(chequeandoCaramelos){ // si esta chequeando los caramelos no permite movimientos
            ubicarImagenPosicionInicial(objImg.img);
            return;
          }

          // solamente si puede colocarse una posicion de la actual cambia las imagenes
          // caso contrario regresa el caramelos a su lugar de origen
          if(rowImg == rowCont && Math.abs(colImg - colCont) == 1 ||
             colImg == colCont && Math.abs(rowImg - rowCont) == 1){
                actualizaImagen(objImg,  dataCont); // coloca los datos de la imagen del contenedor
                actualizaImagen(objCont, dataImg); // coloca los datos de la imagen que fue movida
                moveOnePosition = true;
             }

          ubicarImagenPosicionInicial(objImg.img);

          if(moveOnePosition){
            $('#movimientos-text').text(++movimientos); // añadimos un movimiento
            chequearCaramelosConsecutivos(true); // realiza el chequeo de caramelos consecutivos
          }
        }
      });
}

// coloca la imagen en la posicion inicial
function ubicarImagenPosicionInicial(img){
    img.css("position", "relative"); // mueve al caramalo a su lugar de origen
    img.css("left", "0px");
    img.css("top", "0px");
}

// actualiza los datos de la imagen
function actualizaImagen(objImg, data){
    objImg.data = data; // coloca el dato de la imagen (1,2,3, o 4)
    objImg.img.attr("data", data);
    if(data == 0 ){
        objImg.img.attr('src', "");
    }else{
        objImg.img.attr('src', "image/"+ data +".png");
    }
}


// cambia el color del titulo
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

// funcion que muestra los resultados una vez concluido el tiempo
function mostrarFinalResultados(){

    $('#timer').text('00:00');

    let tablero = $('.panel-tablero');
    let width   = tablero.width();

    tablero.hide("drop", {direction : 'left'}, 1000);

    $('.time').hide();

    $('.score, .moves').animate({
        position : 'absolute',
        width:  "+="+width,
        transition: "all 0.2s linear",
        left : 0,
        right : 0,
    },{
        duration: 1000,
        queue : false
    });

    $(".btn-reinicio").text("Iniciar");
}

// funcion de inicio
$(function(){

    // realiza el cambio de color del titulo
    cambiaColorTitulo();

    // boton click en inicio
    $(".btn-reinicio").on("click", function() {
        iniciarJuego();
    });
});
