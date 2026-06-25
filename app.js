const canvas = document.querySelector("canvas")
const circleBtn = document.querySelector(".circle-btn")
const squareBtn = document.querySelector(".square-btn")
const pencilBtn = document.querySelector(".pencil-btn")
const ctx = canvas.getContext("2d")

let shapes = []

let clicked = false

canvas.height = window.innerHeight
canvas.width = window.innerWidth

let drawShapeType
let x = 0
let y = 0
let pencilPath = []


circleBtn.addEventListener("click", () => {
    drawShapeType = "circle"
    console.log(drawShapeType)

})

squareBtn.addEventListener("click", () => {
    drawShapeType = "square"
    console.log(drawShapeType)
})


pencilBtn.addEventListener("click", () => {
    drawShapeType = "pen"
    console.log(drawShapeType);
})

canvas.addEventListener("mousedown", (e) => {
    clicked = true
    pencilPath = [] 
    const rect = canvas.getBoundingClientRect();

    x = e.clientX
    y = e.clientY
})

canvas.addEventListener("mousemove", (e) => {

    if (!clicked) return

    const rect = canvas.getBoundingClientRect();

    const w = e.clientX - x
    const h = e.clientY - y

    if (drawShapeType === "pen") {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(e.clientX, e.clientY)
        ctx.stroke()

        x = e.clientX
        y = e.clientY
        pencilPath.push({ x, y })

    } else {
        // ✅ only clear for rect/circle preview
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShape()

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        if (drawShapeType === "circle") {
            const radius = Math.sqrt(w * w + h * h) / 2
            const centerX = x + w / 2
            const centerY = y + h / 2
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
            ctx.stroke()
        } else if (drawShapeType === "square") {
            ctx.beginPath()
            ctx.strokeRect(x, y, w, h)
        }
    }

})

canvas.addEventListener("mouseup", (e) => {
    clicked = false
    const rect = canvas.getBoundingClientRect();

    const w = e.clientX - x
    const h = e.clientY - y

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShape()


    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1
    ctx.beginPath()

    if (drawShapeType === "square") {
        ctx.strokeRect(x, y, w, h)
        shapes = [...shapes, { type: "square", x, y, w, h }]
    } else if (drawShapeType === "circle") {
        const radius = Math.sqrt(w * w + h * h) / 2
        const centerX = x + w / 2
        const centerY = y + h / 2
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.stroke()
        shapes = [...shapes, { type: "circle", x: centerX, y: centerY, radius: radius }]
    } else if (drawShapeType === "pen") {
        shapes = [...shapes, { type: "pen", points: pencilPath }]
        drawShape()
    }
})


function drawShape() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach(shape => {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1
        ctx.beginPath()

        if (shape.type === "square") {
            ctx.strokeRect(shape.x, shape.y, shape.w, shape.h)
        } else if (shape.type === "circle") {            
            console.log(shape.type)
            ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI)
            ctx.stroke()
        } else if (shape.type === "pen") {
            shape.points.forEach((p, i) => {
                console.log(p.x)
                if (i === 0) {
                    ctx.moveTo(p.x, p.y)
                } else {
                    ctx.lineTo(p.x, p.y)  // ✅ draw to current pos
                }
            })
            ctx.stroke()
        }
    })
}
