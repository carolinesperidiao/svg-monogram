let tamSVG = 285 //define o tamanho do svg (285 no PC dá perfeito com o croche IRL)
document.getElementById("box").setAttribute("width",tamSVG)
document.getElementById("box").setAttribute("height",tamSVG)
document.getElementById("box").setAttribute("viewBox",`0 0 ${tamSVG} ${tamSVG}`)

let outCircle = document.getElementById("circ-outside")
let inCircle = document.getElementById("circ-inside")
let vertexGroup = document.getElementById("vertexes")
let genGroup = document.getElementById("geral")
let pathGroup = document.getElementById("paths")

//variáveis pra futuramente tornar dinamicos com inputs
genGroup.style.transform = "rotate(0deg)"
let SVGrotation = 0
let vertSize = 3 //tamanho da bolinha de vertice
let hoopThickness = 20 //largura da argola
let marginSVG = 0.7 //margem
let numSides = 7 //numero de lados do
let numPetals = 6 //numero default
let bigRadius = (tamSVG/2)*marginSVG //raio do circulo maior
let coordsPts = []
let petalRad = 1 //raio da petala, nao entendi como funciona ainda mas enfim

function redefineVars(){
    inputRotacao.value = 0 //SVGrotation
    inputHoop.value = 20 //hoopThickness
    inputNumSides.value = 7 //numSides
    inputNumPetals.value = 6 //numPetals
    buildShape()
}


//queries de input HTML
let inputRotacao = document.getElementById('rotacao')
let inputHoop = document.getElementById('hoop-thickness')
let inputNumSides = document.getElementById('num-sides')
let inputNumPetals = document.getElementById('num-petals')
// let inputPetalRad = document.getElementById('petal-rad')

inputRotacao.value = SVGrotation
inputHoop.value = hoopThickness
inputNumSides.value = numSides
inputNumPetals.value = numPetals

inputRotacao.parentNode.querySelector("span").innerHTML = inputRotacao.value
inputHoop.parentNode.querySelector("span").innerHTML = inputHoop.value
inputNumSides.parentNode.querySelector("span").innerHTML = inputNumSides.value
inputNumPetals.parentNode.querySelector("span").innerHTML = inputNumPetals.value
// inputPetalRad.parentNode.querySelector("span").innerHTML = inputPetalRad.value

setupInput(inputRotacao)
setupInput(inputHoop)
setupInput(inputNumSides)
setupInput(inputNumPetals)

function setupInput(inputTag){
let label = inputTag.parentNode
let display = label.querySelector("span")
inputTag.setAttribute("oninput","updateValue()")
console.log(display)
}

function rangeDependencies(){
    inputNumPetals.setAttribute("min", Math.ceil(inputNumSides.value/2))
    inputNumPetals.setAttribute("max", inputNumSides.value)
    if(inputNumPetals > inputNumSides){
        inputNumPetals = inputNumSides
    }
    inputNumPetals.parentNode.querySelector("span").innerHTML = inputNumPetals.value
}

function updateValue(){
event.currentTarget.parentNode.querySelector("span").innerHTML = event.currentTarget.value
rangeDependencies()
buildShape()
}

setupInput(inputRotacao)

buildShape()

function buildShape(){

    SVGrotation= inputRotacao.value
    genGroup.style.transform = `rotate(${SVGrotation}deg)`
    hoopThickness = inputHoop.value
    numSides = inputNumSides.value
    // numPetals = inputNumPetals.value

//config círculo maior
outCircle.setAttribute("r", bigRadius)
outCircle.setAttribute("cx", (tamSVG/2))
outCircle.setAttribute("cy", (tamSVG/2))
//config círculo menor
inCircle.setAttribute("r", (outCircle.attributes.r.value) - hoopThickness)
inCircle.setAttribute("cx", (tamSVG/2))
inCircle.setAttribute("cy", (tamSVG/2))

let initialCenter = [outCircle.attributes.cx.value, outCircle.attributes.cy.value-outCircle.attributes.r.value]

//pegando as circunferências
let outCircleLength = outCircle.getTotalLength()
let inCircleLength = inCircle.getTotalLength()

//criando circulos pra cada vertice que serão os pontos de referência
vertexGroup.innerHTML = ""
for (let i=0; i<numSides; i++){
    vertexGroup.innerHTML = vertexGroup.innerHTML + `<circle id="vert-${i+1}" r="${vertSize}" />`
}

//atribuindo as cx e cy e alimentando o array 2D com as coordenadas
for (let j=0; j<numSides; j++){
    coordsPts[j] = [`${outCircle.getPointAtLength(j*(outCircleLength/numSides)).x}`, `${outCircle.getPointAtLength(j*(outCircleLength/numSides)).y}`]
    document.getElementById(`vert-${j+1}`).setAttribute("cx",`${coordsPts[j][0]}`)
    document.getElementById(`vert-${j+1}`).setAttribute("cy",`${coordsPts[j][1]}`)
}


numPetals = numSides //pressupondo que todas as pétalas existem
numPetals = parseInt(inputNumPetals.value) //contradizendo a linha acima rs

let pathDrawing = `M ${coordsPts[0][0]} ${coordsPts[0][1]}` //começo da path

if(numPetals < numSides){ //quando tiver menos pétalas do que lados, cria a linha angular vindo do raio interno
    pathDrawing = `M ${inCircle.getPointAtLength(inCircleLength-6).x} ${inCircle.getPointAtLength(inCircleLength-6).y} L ${coordsPts[0][0]} ${coordsPts[0][1]}`
}

for(let g=0; g < numPetals+1; g++){ //adiciona as curvas de pétala
    if(g < numSides){
pathDrawing = pathDrawing + `A ${petalRad} ${petalRad} 0 0 1 ${coordsPts[g][0]} ${coordsPts[g][1]}`} else{ //fecha a path no caso de numero igual de petalas e lados
    pathDrawing = pathDrawing + `A ${petalRad} ${petalRad} 0 0 1 ${coordsPts[0][0]} ${coordsPts[0][1]}`
}
}

if(numPetals < numSides){ //quando tiver menos pétalas do que lados, cria a linha angular de fechamento no raio interno, e adiciona o arco de fechamento que torna a forma sólida
    let endPoint = [inCircle.getPointAtLength(numPetals*(inCircleLength/numSides)+6).x, inCircle.getPointAtLength(numPetals*(inCircleLength/numSides)+6).y]
    pathDrawing = pathDrawing + `L ${endPoint[0]} ${endPoint[1]} A ${bigRadius-hoopThickness} ${bigRadius-hoopThickness} 0 1 0 ${inCircle.getPointAtLength(inCircleLength-6).x} ${inCircle.getPointAtLength(inCircleLength-6).y}`
}

//concretiza os comandos d na path
paths.innerHTML = `<path id="flower" d="${pathDrawing}" />`

//no caso de numero de petalas=numero de lados, cria uma mask para simular uma subtração booleana

if(numPetals >= numSides){
    document.getElementById("flower").setAttribute("mask","url(#in-circle)")
    let copiaCirculo = inCircle.outerHTML
    console.log(copiaCirculo)
    document.getElementById("box").insertAdjacentHTML("afterbegin",`<mask id="in-circle"><rect width="100%" height="100%" fill="white" /><g fill="black">${copiaCirculo}</g></mask>`)
}
//cortando as masks de sobra
let sobraMasks = document.querySelectorAll("mask#in-circle")
if(sobraMasks.length >0){
for(let y=1; y < sobraMasks.length; y++){
    sobraMasks[y].outerHTML = ""
}
}
//esqueminha de download

document.querySelector("g.guias-argola").style.visibility = "hidden" //escondendo as guias temporariamente

const svgDownload = document.getElementById("box").outerHTML //pega o outerhtml

const blob = new Blob([svgDownload], {type : 'image/svg+xml'}) //cria um blob, whatever the hell it is
let urlDownload = URL.createObjectURL(blob)

document.getElementById("link-download").href=urlDownload //atribui o download ao link

document.querySelector("g.guias-argola").style = "" //voltando a mostrar as guias
}

