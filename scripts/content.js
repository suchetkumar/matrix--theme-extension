var settings;

// a higher fade factor will make the characters fade quicker
var fadeFactor = 0.06;
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
    // 911-1277
    return String.fromCharCode(911+Math.floor(Math.random()*367));
}


function init(body)
{
	canvas = document.createElement('canvas');
    canvas.width = "100%";
    canvas.height = "100%";
    canvas.style.cssText += "z-index:-1; position:fixed";
    body.prepend(canvas);
    // console.log("added canvas to body");

	ctx = canvas.getContext( '2d' );

    // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
    const resizeObserver = new ResizeObserver( entries =>
    {
        for ( let entry of entries )
        {
            if ( entry.contentBoxSize )
            {
                // Firefox implements `contentBoxSize` as a single content rect, rather than an array
                const contentBoxSize = Array.isArray( entry.contentBoxSize ) ? entry.contentBoxSize[0] : entry.contentBoxSize;

                canvas.width = contentBoxSize.inlineSize;
                canvas.height = window.innerHeight;

                initMatrix(settings);
            }
        }
    } );

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
}

function draw()
{
    // draw a semi transparent black rectangle on top of the scene to slowly fade older characters
    ctx.fillStyle = "rgba( 0 , 0 , 0 , "+fadeFactor/settings.transparencyChoice+" )";
    ctx.fillRect( 0 , 0 , canvas.width , canvas.height );

    ctx.font = (settings.fontChoice)+"px monospace";
    ctx.fillStyle = settings.colorChoice;
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
    // console.log('tick');
    draw();
    setTimeout(tick , settings.sleep);
}

function updateTileSize()
{
    tileSize = Math.min( Math.max( document.getElementById("tileSize").value , 10 ) , 100 );
    initMatrix();
}

function updateFadeFactor()
{
    fadeFactor = Math.min( Math.max( document.getElementById("fadeFactor").value , 0.0 ) , 1.0 );
    initMatrix();
}

function getSettings() {
    settings = {};
    chrome.storage.local.get(["colorChoice", "fontChoice", "speedChoice", "transparencyChoice"], function(items) {
        if (items.colorChoice) {
            // console.log("setting the preferences");
            const r = parseInt(items.colorChoice.substr(1,2), 16);
            const g = parseInt(items.colorChoice.substr(3,2), 16);
            const b = parseInt(items.colorChoice.substr(5,2), 16);
            settings.colorChoice = `rgb(${r},${g},${b})`;
            settings.fontChoice = parseInt(items.fontChoice, 10);
            settings.speedChoice = parseInt(items.speedChoice, 10);
            settings.transparencyChoice = parseFloat(items.transparencyChoice);
        } else {
            // console.log("no settings. using defaults");
            settings.colorChoice = `rgb(0,255,0)`;
            settings.fontChoice = 11;
            settings.speedChoice = 20;
            settings.transparencyChoice = 0.7;
        }
        settings.sleep = Math.floor(1000/settings.speedChoice)
    });
    return settings;
}    
    
settings = getSettings();
// console.log("Settings: ", settings);
var body = document.getElementsByTagName("body")
if (body) {
    // console.log("found body");
    init(body[0]);
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    settings = getSettings();
    // console.log("Settings: ", settings);
});





