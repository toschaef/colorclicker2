document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        checkbox.checked = false;
    });
    document.querySelectorAll(".slider").forEach((slider) => {
        slider.value = 5;
    });
    document.querySelectorAll(".sliderOutput").forEach((output) => {
        output.textContent = "5 seconds";
    });
});

const randGen = () => {
    const randomHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    return randomHex() + randomHex() + randomHex();
}

const redGen = () => {
    const randomGBHex = () => Math.floor(Math.random() * 128).toString(16).padStart(2, '0');
    const randomRHex = () => Math.floor(Math.random() * 128 + 126).toString(16).padStart(2, '0');
    return randomRHex() + randomGBHex() + randomGBHex();
}

const greenGen = () => {
    const randomRBHex = () => Math.floor(Math.random() * 128).toString(16).padStart(2, '0');
    const randomGHex = () => Math.floor(Math.random() * 128 + 126).toString(16).padStart(2, '0');
    return randomRBHex() + randomGHex() + randomRBHex();
}

const blueGen = () => {
    const randomRGHex = () => Math.floor(Math.random() * 128).toString(16).padStart(2, '0');
    const randomBHex = () => Math.floor(Math.random() * 128 + 126).toString(16).padStart(2, '0');
    return randomRGHex() + randomRGHex() + randomBHex();
}

const colorCache = {};
let generator = randGen;

//fetch color name from color.pizza api
async function findColorName(colorHex) {
    if (colorCache[colorHex]) {
        return colorCache[colorHex];
    }

    try {
        const response = await fetch(`https://api.color.pizza/v1/${colorHex}`);
        const data = await response.json();

        if (data.colors && data.colors.length > 0) {
            colorCache[colorHex] = {
                name: data.colors[0].name,
                luminance: data.colors[0].luminance
            };
            return {
                name: data.colors[0].name,
                luminance: data.colors[0].luminance
            };
        } else {
            console.log("No info found")
            return {name: "Unknown color", luminance: 0};
        }
    } catch (error) {
        console.error('Error fetching color data:', error);
        return {name: "error", luminance: 0};
    }
}

var colorList = [];
let current = 0;

//initalize array with 5 colors
let initalizeFlag = false;
async function initColorList() {
    if (initalizeFlag) return;
    initalizeFlag = true;


    let promises = [];
    for (let i = 0; i < 5; i++) {
        const colorHex = generator();
        console.log(colorHex);

        promises.push(
            findColorName(colorHex).then(colorData => {
                return {name: colorData.name, hex: colorHex, luminance: colorData.luminance};
            })
        );
    }

    const colorData = await Promise.all(promises);
    colorList.push(...colorData);
    initalizeFlag = false;
}

// function for adding new color to end of list
async function addToList() {
    const colorHex = generator();
    const colorData = await findColorName(colorHex);

    colorList.push({name: colorData.name, hex: colorHex, luminance: colorData.luminance});
}

document.addEventListener("DOMContentLoaded", initColorList);
var flag = false;

async function nextInList() {
    if (!flag) {
        document.getElementById('tutorial').textContent = "";
        document.getElementById('settingsTutorial').textContent = "";
        document.getElementById('leftTutorial').textContent = "";
        document.getElementById('rightTutorial').textContent = "";
    }

    if (current < colorList.length - 1) {
        current++;
        updateColor();
        
        if (current > colorList.length - 5){
            await addToList();
        }
    }
    flag = true;
}

function prevInList() {
    if (current > 0) {
        current--;
        updateColor();
    }
    if (flag && current === 0) {
        document.getElementById('tutorial').textContent = "SECRET COLOR"
        flag = false;
    }
}

function updateColor() {
    const colorHex = colorList[current].hex;
    const colorName = colorList[current].name;
    const colorLum = colorList[current].luminance;
    const prevHex = current > 0 ? colorList[current - 1].hex : colorHex;
    const nextHex = current < colorList.length - 1 ? colorList[current + 1].hex : colorHex;


    document.getElementById('colorName').textContent = colorName;
    document.body.style.backgroundColor = `#${colorHex}`;

    const textColor = colorLum > 50 ? "black" : "white";
    document.getElementById('colorName').style.color = textColor;

    document.getElementById('leftHoverButton').style.backgroundColor = `#${prevHex}`;
    document.getElementById('rightHoverButton').style.backgroundColor = `#${nextHex}`;

    //check if hex should be displayed
    if (hexCheckbox.checked) {
        document.getElementById("colorName").textContent += ` - #${colorHex}`;
    }
}

const modal = document.getElementById("myModal");
const openBtn = document.getElementById("hoverButton");
const closeSpan = document.getElementsByClassName("close")[0];

document.body.addEventListener("click", function (e) {
    if (!modal.contains(e.target)) {
        nextInList();
    }
});

let isArrowKeyAllowed = true;
function throttle(callback) {
    if (isArrowKeyAllowed) {
        isArrowKeyAllowed = false;
        callback();
        setTimeout(() => {
            isArrowKeyAllowed = true;
        }, 150);
    }
}

const switchCheckbox = document.getElementById("switchCheckbox");

//listen for arrow left/right and space
document.body.addEventListener('keydown', function (event) {    
    switch (event.key) {
        case "ArrowLeft":
            throttle(prevInList);
            break;
        case "ArrowRight":
        case " ":
            event.preventDefault();
            throttle(nextInList);
            break;
    }
});

//left right button
const leftBtn = document.getElementById("leftHoverButton");
const rightBtn = document.getElementById("rightHoverButton");

leftBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    prevInList();
});

rightBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    nextInList();
})

//SETTINGS
//
//
function openModal(e) {
    e.stopPropagation();
    modal.style.display = "block";
}

function closeModal(e) {
    e.stopPropagation();
    modal.style.display = "none";
}

openBtn.addEventListener("click", openModal);
closeSpan.addEventListener("click", closeModal);

window.onclick = function(e) {
    if (e.target === modal) {
        closeModal(e);
    }
}

//hex button press
const hexCheckbox = document.getElementById("hexCheckbox");

hexCheckbox.addEventListener('change', () => {
    const colorHex = colorList[current].hex; 
    if (hexCheckbox.checked) {
        document.getElementById("colorName").textContent += ` - #${colorHex}`;
    } else {
        document.getElementById("colorName").textContent = colorList[current].name;
    }
});

//position change
const positionCheckbox = document.getElementById("positionCheckbox")
const colorName = document.getElementById("colorName");

positionCheckbox.addEventListener('change', () => {
    if (positionCheckbox.checked) {
        colorName.classList.add('bottom-left');
    } else {
        colorName.classList.remove('bottom-left');
    }
})

//is it better to just have a singular update on modal close?
//seems possible

//on switch press, auto update color every specified amount of seconds (starts at 5)
let intervalID;
let intervalSet = 5000;

var slider = document.getElementById("myRange");
var output = document.getElementById("sliderOutput");
output.innerHTML = slider.value + " seconds";

slider.oninput = function() {
    intervalSet = this.value * 1000
    output.innerHTML = this.value + " seconds";
    if (switchCheckbox.checked) {
        clearInterval(intervalID)
        intervalID = setInterval(nextInList, intervalSet);
    }
}

switchCheckbox.addEventListener('change', () => {
    if (switchCheckbox.checked) {
        clearInterval(intervalID);
        intervalID = setInterval(nextInList, intervalSet);
    } else {
        clearInterval(intervalID);
    }
})

//palettes
//
const paletteButtons = document.querySelectorAll(".paletteButton");
let currentPalette = "random";

paletteButtons.forEach((button) => {
    button.addEventListener("click", () => {
    currentPalette = button.getAttribute("data");

    paletteButtons.forEach((btn) => btn.classList.remove("currentPalette"));
    button.classList.add("currentPalette");
    updatePalette();
    
    });
});

async function updatePalette() {
    const loadingOverlay = document.getElementById("loadingOverlay")
    loadingOverlay.classList.add("active");
    try {
        switch (currentPalette) {
            case "random":
                console.log("random");
                generator = randGen;
                colorList.length = 0;
                await initColorList();
                current = 1;
                updateColor();
                break;
            case "red":
                console.log("red");
                generator = redGen;
                colorList.length = 0;
                await initColorList();
                current = 1;
                updateColor();
                break;
            
            case "green":
                console.log("green");
                generator = greenGen;
                colorList.length = 0;
                await initColorList();
                current = 1;
                updateColor();
                break;
            case "blue":
                console.log("blue");
                generator = blueGen;
                colorList.length = 0;
                await initColorList();
                current = 1;
                updateColor()
                break;
        }
    } finally {
        loadingOverlay.classList.remove("active");
    }
}