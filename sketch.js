let textTyped = "DESIGN";
let font;
let fontSize = 200;
let textImg;
let colorMap;

let pointDensity = 6;
let circleSize = 6;
let randomAmount = 0;

let finishArray = [];
let startArray = [];
let stepAmount = 100;
let counter = 0;
let circleSlider;
let densitySlider;
let counterDir = true;

let filled = true;
let animate = false;
let useLines = false;
let lineDistance = 3;
let lineDensity = 20;

let checkbox;
let animateBox;
let useLineBox;
let cSize = $("#canvasHolder").width();

let rotationAngle = 1;

let rotateBox;
let rotateLines = false;

let actRandomSeed = 0;

let dropBox;
let dropText = false;
let dropCounter = 0;

let dropSpeedSlider;
let dropSpeed = 0.003;

//mp is mousePressed
let mp = false;
let mousePointsArray = [];
let lerpCounter=0;
let invertLerpCounter = false;

let positionText;
let repositionText=false;
let translateXPos=0;
let translateYPos=0;

function preload() {
  font = loadFont("data/FreeSansBold.ttf");
  // opentype.load('data/FreeSansBold.ttf', function (err, f) {
  //     if (err) {
  //         console.log(err);
  //     } else {
  //         font = f;
  //         loop();
  //     }
  // });
  colorMap = loadImage('data/colorMap.png');
}

function setup() {
  let canvas = createCanvas(cSize, cSize);
  canvas.parent('canvasHolder');

  createTextGraphic();
  colorMap.loadPixels();
  createArrays();
  frameRate(30);

  circleSlider = createSlider(1, 20, 6);
  circleSlider.mouseReleased(update);
  circleSlider.parent('radiusController');

  densitySlider = createSlider(1, 20, 6);
  densitySlider.mouseReleased(update);
  densitySlider.parent('densityController');

  fontSizeSlider = createSlider(100, 800, 200);
  fontSizeSlider.mouseReleased(update);
  fontSizeSlider.parent('fontSizeController');

  randomSlider = createSlider(0, 200, 0);
  randomSlider.mouseReleased(update);
  randomSlider.parent('randomController');

  checkBox = createCheckbox('Filled', true);
  checkBox.changed(update);
  checkBox.parent('checkBoxController');

  animateBox = createCheckbox('Animate', false);
  animateBox.changed(update);
  animateBox.parent('animateBoxController');

  useLineBox = createCheckbox('Use Lines', false);
  useLineBox.changed(update);
  useLineBox.parent('useLineBoxController');

  rotateBox = createCheckbox('Random rotate once', false);
  rotateBox.changed(update);
  rotateBox.parent('useRotateBoxController');

  dropBox = createCheckbox('Drop', false);
  dropBox.changed(update);
  dropBox.parent('dropBoxController');

  dropSpeedSlider = createSlider(0, 10, 5);
  dropSpeedSlider.mouseReleased(update);
  dropSpeedSlider.parent('dropSpeedController');


  reverseLerpBox = createCheckbox('Reverse mouse lerp', false);
  reverseLerpBox.changed(update);
  reverseLerpBox.parent('reverseLerpController');


  positionText = createCheckbox('Position text', false);
  positionText.changed(update);
  positionText.parent('positionTextController');

}

function createTextGraphic() {
  // create an offscreen graphics object to draw the text into
  //console.log("check")
  textImg = createGraphics(width, height);
  textImg.pixelDensity(1);
  textImg.background(255);
  textImg.textFont(font);
  textImg.textSize(fontSize);
  textImg.textAlign(CENTER);

  textImg.text(textTyped, width / 2, fontSize);
  textImg.loadPixels();
}

function createArrays() {
  for (let x = 0; x < textImg.width; x += pointDensity) {
    for (let y = 0; y < textImg.height; y += pointDensity) {
      // Calculate the index for the pixels array from x and y
      let index = (x + y * textImg.width) * 4;

      // Get the red value from image
      let r = textImg.pixels[index];

      if (r < 128) {
        let rValue = colorMap.pixels[index];
        let gValue = colorMap.pixels[index + 1];
        let bValue = colorMap.pixels[index + 2];
        let fillColor = color(rValue, gValue, bValue);

        finishArray.push({
          xPos: x,
          yPos: y,
          fill: fillColor
        });
        startArray.push({
          xPos: x + random(-randomAmount, randomAmount),
          yPos: y + random(-randomAmount, randomAmount),
          fill: fillColor
        })
      }

    }
  }
}

function draw() {
  background(0, 20);

  noFill();
  noStroke();
  // if(!showLines){
  push();
    //this will translate the text to the new poistion
  translate(translateXPos, translateYPos);
  //draw the text on the screen using ellipses or lines
  drawEllipseText();
  pop();
  //fixes the randomness so it doesnt calculate a new random every frame
  randomSeed(actRandomSeed);
}



function drawEllipseText() {
  //calculate each line/ellipse
  for (let i = 0; i < finishArray.length - 1; i++) {
    if (filled === true) {
      noStroke;
      fill(finishArray[i].fill);
    } else {
      noFill();
      stroke(finishArray[i].fill);

    }
    //calculate lerp amount between the start and finish array
    let lerpAmount = (counter / finishArray.length) * stepAmount;

    //make lerp max to 1;
    if (lerpAmount > 1) {
      lerpAmount = 1;
    }
    //check if the mouse is pressed
    let xPos,yPos;
    if(!mp){
      //lerp normally if the mouse is not pressed
       xPos = lerp(startArray[i].xPos, finishArray[i].xPos, lerpAmount);
       yPos = lerp(startArray[i].yPos, finishArray[i].yPos, lerpAmount);
    } else {
      //if mouse is pressed calculate a lerp amount from the initial position to the mouse position
      //
       xPos = lerp(startArray[i].xPos, finishArray[i].xPos, lerpAmount);
       yPos = lerp(startArray[i].yPos, finishArray[i].yPos, lerpAmount);
       xPos = lerp(xPos, mouseX, lerpCounter);
       yPos = lerp(yPos, mouseY, lerpCounter);
       //makes the text eather smaller or bigger
       if(invertLerpCounter) {
          lerpCounter-=0.00001;
       } else {
          lerpCounter+=0.00001;
       }
       //same as above, keep the lerp  to 1 max;
       if(lerpCounter>1){
         lerpCounter=1;
       }
    }
    //check if it will uses lines or elipses to draw the line
    if (useLines) {
      //lines
      push();
      // rotate(-45);
      angleMode(DEGREES);
      //trick to draw at 0 0
      translate(xPos, yPos);
      //changes the line weight
      strokeWeight(circleSize);
      //an option like a true or false only returns 2 values
      let rotateAngle = int(random(0, 2));
      if (rotateLines === true) {
        if (rotateAngle === 1) {
          //rotate if the value is true (1)
          rotate(90);
        }
      }
      //logic for the drop text functionality
      if(dropText){
        // console.log('lol');
        //bug fix so that all the lines drop the same way
        if(rotateLines===true){
          if(rotateAngle===1){
            translate(dropCounter,0);
          } else{
            translate(0,dropCounter);
          }
        } else {
          translate(0,dropCounter);
        }

      }
      line(0, 0, 10, 10);
      pop();
    } else {
      //ellipse
      push();
      translate(xPos, yPos);
      if(dropText){
        translate(0,dropCounter);
      }

      ellipse(0, 0, circleSize, circleSize);
      pop();
    }
    //set the speed the text drops
    dropCounter+=dropSpeed;
    if(dropCounter>width){
      //if the text dropped to the bottom go back to top(initial position)
      dropCounter=0;
    }
  }


  if (counterDir === true & animate === true) {
    if (counter * stepAmount < finishArray.length) {
      counter++;
    } else {
      counterDir = false;
      counter--;
    }
  } else {
    if (counter * stepAmount > 0) {
      counter--;
    } else {
      counterDir = true;
    }
  }
}

function update() {
  //updates values and arrays every time something is pressed
  circleSize = circleSlider.value();
  pointDensity = densitySlider.value();
  fontSize = fontSizeSlider.value();
  randomAmount = randomSlider.value();
  dropSpeed = dropSpeedSlider.value()/1000;
  if (checkBox.checked() === true) {
    filled = true;
  } else {
    filled = false;
  }

  if (animateBox.checked() === true) {
    animate = true;
  } else {
    animate = false;
  }

  if (useLineBox.checked() === true) {
    useLines = true;
    filled = false;
  } else {
    useLines = false;
  }
  if (rotateBox.checked() === true) {
    rotateLines = true;
  } else {
    rotateLines = false;
  }

  if (dropBox.checked() === true) {
    dropText = true;
  } else {
    dropText = false;
  }

  if (positionText.checked() === true) {
    repositionText = true;
  } else {
    repositionText = false;
  }

  if (reverseLerpBox.checked() === true) {
    invertLerpCounter = true;
  } else {
    invertLerpCounter = false;
  }

  finishArray = [];
  startArray = [];
  createTextGraphic();
  createArrays();
  counter = 0;
  dropCounter = 0;
}

function keyReleased() {
  // export png
  if (keyCode == CONTROL) saveCanvas(gd.timestamp(), 'png');
}

//made the text dynamic = ads keyboard functionality
function keyPressed() {
  if (keyCode == DELETE || keyCode == BACKSPACE) {
    if (textTyped.length > 0) {
      textTyped = textTyped.substring(0, textTyped.length - 1);
    }
  }
  update();
}

function keyTyped() {
  if (keyCode >= 32) {
    textTyped += key;
  }
  update();
}


//ads mouse functionality
function mousePressed() {
  //dont act if the mouse pos is outside the canvas
  if(mouseX<cSize && mouseY<cSize){
    //change the position of the canvas according to the mouse pos
    if(repositionText) {
      translateXPos = mouseX-width/2;
      translateYPos = mouseY-fontSize/2;
    }
    // let the other scripts know the mouse is pressed
    mp=true;
  }
}

function mouseReleased() {
  //reset the lerp when the click is pressed
  lerpCounter = 0;
  // mouse is not pressed anymore
  mp = false;
}
