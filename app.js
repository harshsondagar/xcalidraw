const canvas = document.querySelector("canvas");
const circleBtn = document.querySelector(".circle-btn");
const squareBtn = document.querySelector(".square-btn");
const pencilBtn = document.querySelector(".pencil-btn");
const curveBtn = document.querySelector(".cruve-btn");
const selectbtn = document.querySelector(".select-btn");
const ctx = canvas.getContext("2d");

let shapes = [];
let selectedSHape = null;
let clicked = false;
let id = 0;
const HANDLE_SIZE = 10;
let threshold = 3;

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let drawShapeType;
let x = 0;
let y = 0;
let resizing = false;
let pencilPath = [];

circleBtn.addEventListener("click", () => {
    drawShapeType = "circle";
    console.log(drawShapeType);
});

squareBtn.addEventListener("click", () => {
    drawShapeType = "square";
    console.log(drawShapeType);
});

pencilBtn.addEventListener("click", () => {
    drawShapeType = "pen";
    console.log(drawShapeType);
});

curveBtn.addEventListener("click", () => {
    drawShapeType = "curve";
});

selectbtn.addEventListener("click", () => {
    drawShapeType = "select";
});

function isMouseInsideShape(mouseX, mouseY, shape) {
    if (shape.type === "curve") {
        // const sx = mouseX - shape.startX;
        // const sy = mouseY - shape.startY;

        // const disStart = Math.sqrt(sx * sy + sx * sy);

        // if (disStart <= threshold) {
        //   return { selec: true, start: true };
        // }

        // const ex = mouseX - shape.x;
        // const ey = mouseY - shape.y;

        // const disEnd = Math.sqrt(ex * ey + ex * ey);

        // if (disEnd <= threshold) {
        //   return { selec: true, start: false };
        // }

        const dx = mouseX - shape.handleX;
        const dy = mouseY - shape.handleY;

        const distanceToStart = Math.sqrt(dx * dx + dy * dy);

        if (distanceToStart <= threshold) {
            return true;
        }

        // 3. Optional: Fallback to the curve's full bounding box including control points
        const minX = Math.min(shape.startX, shape.endX, shape.handleX);
        const maxX = Math.max(shape.startX, shape.endX, shape.handleX);
        const minY = Math.min(shape.startY, shape.endY, shape.handleY);
        const maxY = Math.max(shape.startY, shape.endY, shape.handleY);

        return mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY;
    }
    const minX = Math.min(shape.s, shape.x + shape.w);
    const minY = Math.min(shape.y, shape.y + shape.h);
    const maxX = Math.max(shape.x, shape.x + shape.w);
    const maxY = Math.max(shape.y, shape.y + shape.h);

    return mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY;
}

canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    pencilPath = [];
    const rect = canvas.getBoundingClientRect();

    x = e.clientX;
    y = e.clientY;

    if (drawShapeType === "select") {
        for (let i = 0; i < shapes.length; i++) {
            let res = isMouseInsideShape(x, y, shapes[i]);
            if (res) {
                selectedSHape = shapes[i];

                let handle = res.start;

                resizeShape(x, y, selectedSHape, handle);
                break;
            }
        }
    }

    if (selectedSHape && isHandleSelected(x, y, selectedSHape)) {
        resizing = true;
        console.log(resizing);

        return;
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (!clicked) return;

    if (resizing) {
        resizeShape(e.clientX, e.clientY, selectedSHape);

        return;
    }

    const rect = canvas.getBoundingClientRect();

    const w = e.clientX - x;
    const h = e.clientY - y;

    if (drawShapeType === "pen") {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();

        x = e.clientX;
        y = e.clientY;
        pencilPath.push({ x, y });
    } else {
        // ✅ only clear for rect/circle preview
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShape();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;

        if (drawShapeType === "circle") {
            const radius = Math.sqrt(w * w + h * h) / 2;
            const centerX = x + w / 2;
            const centerY = y + h / 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (drawShapeType === "square") {
            ctx.beginPath();
            ctx.strokeRect(x, y, w, h);
        } else if (drawShapeType === "curve") {
            console.log("drawing");
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x, y, e.clientX, e.clientY);
            ctx.stroke();

            //   ctx.fillStyle = "blue";
            //   ctx.beginPath();
            //   ctx.arc(50, 20, 5, 0, 2 * Math.PI); // Start point
            //   ctx.arc(50, 100, 5, 0, 2 * Math.PI); // End point
            //   ctx.fill();

            // Control point
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(230, 30, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
});

canvas.addEventListener("mouseup", (e) => {
    id++;
    clicked = false;

    if (resizing) {
        selectedSHape = null;
        resizing = false;
        drawShape();
        return;
    }

    resizing = false;

    const rect = canvas.getBoundingClientRect();

    const w = e.clientX - x;
    const h = e.clientY - y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShape();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();

    if (drawShapeType === "square") {
        ctx.strokeRect(x, y, w, h);
        shapes = [...shapes, { type: "square", id: id, x, y, w, h }];
    } else if (drawShapeType === "circle") {
        const radius = Math.sqrt(w * w + h * h) / 2;
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        shapes = [
            ...shapes,
            { type: "circle", id: id, x: centerX, y: centerY, radius: radius },
        ];
    } else if (drawShapeType === "pen") {
        shapes = [...shapes, { type: "pen", id: id, points: pencilPath }];
        drawShape();
    } else if (drawShapeType === "curve") {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x, y, e.clientX, e.clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc((x + e.clientX) / 2, (y + e.clientY) / 2, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.stroke();
        shapes = [
            ...shapes,
            {
                type: "curve",
                id: id,
                startX: x,
                startY: y,
                cpx: x,
                cpy: y,
                x: e.clientX,
                y: e.clientY,
                handleX: (x + e.clientX) / 2,
                handleY: (y + e.clientY) / 2,
            },
        ];
    }
});

function drawShape() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        // console.log(shape)
        if (selectedSHape && selectedSHape.id === shape.id) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 3;

            ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
            ctx.fillStyle = "blue";
            ctx.fillRect(
                shape.x + shape.w - HANDLE_SIZE / 2,
                shape.y + shape.h - HANDLE_SIZE / 2,
                HANDLE_SIZE,
                HANDLE_SIZE,
            );
        }

        if (shape.type === "square") {
            ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
        } else if (shape.type === "circle") {
            console.log(shape.type);
            ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (shape.type === "pen") {
            shape.points.forEach((p, i) => {
                if (i === 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            });
            ctx.stroke();
        } else if (shape.type === "curve") {
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.quadraticCurveTo(shape.cpx, shape.cpy, shape.x, shape.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(shape.startX, shape.startY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(shape.handleX, shape.handleY, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(shape.x, shape.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.stroke();
        }
    });
}

function resizeShape(x, y, shape, handle) {
    if (shape.type === "curve") {
        // if (handle) {
        //   shape.startX = x;
        //   shape.startY = y;
        //   drawShape();
        //   return;
        // }

        // if (!handle) {
        //   shape.startX = x;
        //   shape.startY = y;
        //   drawShape();
        //   return;
        // }

        shape.handleX = x;
        shape.handleY = y;

        let cpx = 2 * shape.handleX - (shape.startX + shape.x) / 2;
        let cpy = 2 * shape.handleY - (shape.startY + shape.y) / 2;
        shape.cpx = cpx;
        shape.cpy = cpy;
        drawShape();
        return;
    }

    shape.w = x - shape.x; // no handle coords needed!
    shape.h = y - shape.y;
    drawShape();
}

function isHandleSelected(x, y, shape) {
    if (shape.type === "curve") {
        const dx = x - shape.handleX;
        const dy = y - shape.handleY;
        const distanceToStart = Math.sqrt(dx * dx + dy * dy);

        if (distanceToStart <= threshold) {
            return true;
        }
    }

    const handleX = shape.x + shape.w - HANDLE_SIZE / 2;
    const handleY = shape.y + shape.h - HANDLE_SIZE / 2;

    return (
        x >= handleX &&
        x <= handleX + HANDLE_SIZE &&
        y >= handleY &&
        y <= handleY + HANDLE_SIZE
    );
}
