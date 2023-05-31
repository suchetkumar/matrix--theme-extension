var settings;

// a higher fade factor will make the characters fade quicker
var fadeFactor = 0.2;
var canvas;
var ctx;
var columns = [];
var maxStackHeight;

function randomChar() {
    let r = Math.random();
    // 33-126
    if (r < 0.094) return String.fromCharCode(33+Math.floor(Math.random()*94));
    // 161-687
    if (r < 0.62) return String.fromCharCode(161+Math.floor(Math.random()*527));
    // 931-1277
    return String.fromCharCode(931+Math.floor(Math.random()*347));
}


function init(body)
{
    // console.log('init');
    canvas = document.getElementsByTagName('canvas')
    if (canvas.length > 0) {
        canvas[0].remove();
    }
    canvas = document.createElement('canvas');
    canvas.width = "100%";
    canvas.height = "100%";
    canvas.style.cssText += "z-index:-1; position:fixed";
    body.prepend(canvas);
    // console.log("added canvas to body");
    ctx = canvas.getContext( '2d' );
    // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
    const resizeObserver = new ResizeObserver( entries => {
        for ( let entry of entries ) {
            if ( entry.contentBoxSize ) {
                // Firefox implements `contentBoxSize` as a single content rect, rather than an array
                const contentBoxSize = Array.isArray( entry.contentBoxSize ) ? entry.contentBoxSize[0] : entry.contentBoxSize;
                canvas.width = contentBoxSize.inlineSize;
                canvas.height = window.innerHeight;
                initMatrix();
            }
        }
    });
    // observe the size of the document
    resizeObserver.observe( document.documentElement );
    // start the main loop
    tick();
}

function initMatrix()
{
    columns = [];

    maxStackHeight = Math.ceil(canvas.height/settings.fontChoice);

    // divide the canvas into columns
    for ( let i = 0 ; i < canvas.width/settings.fontChoice ; ++i )
    {
        var column = {};
        // save the x position of the column
        column.x = i*settings.fontChoice;
        // create a random stack height for the column
        column.stackHeight = 10+Math.random()*maxStackHeight;
        // add a counter to count the stack height
        column.stackCounter = Math.random()*column.stackHeight;
        // add the column to the list
        columns.push( column );
    }
    if (settings.enabledChoice) {
        ctx.fillStyle = `rgb(${settings.bgChoice[0]}, ${settings.bgChoice[1]}, ${settings.bgChoice[2]})`;
        ctx.fillRect( 0 , 0 , canvas.width , canvas.height );
    }
}

function draw()
{
    if (settings.enabledChoice == false) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    // draw a semi transparent black rectangle on top of the scene to slowly fade older characters
    ctx.fillStyle = `rgba( ${settings.bgChoice[0]}, ${settings.bgChoice[1]}, ${settings.bgChoice[2]} , ${fadeFactor/settings.transparencyChoice} )`;
    ctx.fillRect( 0 , 0 , canvas.width , canvas.height );

    ctx.font = (settings.fontChoice)+"px monospace";
    ctx.fillStyle = `rgb(${settings.colorChoice[0]}, ${settings.colorChoice[1]}, ${settings.colorChoice[2]})`;
    for ( let i = 0 ; i < columns.length ; ++i )
    {
        // pick a random ascii character (change the 94 to a higher number to include more characters)
        var randomCharacter = randomChar();
        ctx.fillText( randomCharacter , columns[i].x , columns[i].stackCounter*settings.fontChoice+settings.fontChoice );

        // if the stack is at its height limit, pick a new random height and reset the counter
        if ( ++columns[i].stackCounter >= columns[i].stackHeight )
        {
            columns[i].stackHeight = 10+Math.random()*maxStackHeight;
            columns[i].stackCounter = 0;
        }
    }
    ctx.globalAlpha = settings.transparencyChoice;
}

function tick() 
{	
    draw();
    setTimeout(tick , settings.sleep);
}

settings = {};
// defaults
settings.bgChoice = [0,0,0];
settings.colorChoice = [0,255,0];
settings.fontChoice = 11;
settings.speedChoice = 15;
settings.transparencyChoice = 0.4;
settings.sleep = Math.floor(1000/settings.speedChoice);
settings.enabledChoice = true;

function updateSettings() {
    chrome.storage.local.get(["bgChoice", "colorChoice", "fontChoice", "speedChoice", "transparencyChoice", "enabledChoice"], function(items) {
        if (items.colorChoice) {
            // console.log("setting the preferences");
            settings.bgChoice = [
              parseInt(items.bgChoice.substr(1,2), 16), 
              parseInt(items.bgChoice.substr(3,2), 16),
              parseInt(items.bgChoice.substr(5,2), 16)
            ]
            settings.colorChoice = [
              parseInt(items.colorChoice.substr(1,2), 16), 
              parseInt(items.colorChoice.substr(3,2), 16),
              parseInt(items.colorChoice.substr(5,2), 16)
            ]
            settings.fontChoice = parseInt(items.fontChoice, 10);
            settings.speedChoice = parseInt(items.speedChoice, 10);
            settings.transparencyChoice = parseFloat(items.transparencyChoice);
            settings.sleep = Math.floor(1000/settings.speedChoice);
            settings.enabledChoice = items.enabledChoice;
        }
    });
    // console.log(settings);
}    
updateSettings();

chrome.storage.onChanged.addListener((changes, namespace) => {
    updateSettings();
});

function start() {
    var body = document.getElementsByTagName("body")[0]
    init(body);
}

start();

