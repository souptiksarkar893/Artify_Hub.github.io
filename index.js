const canvas = new fabric.Canvas("canvas", {
  isDrawingMode: false,
  selection: true,
});

let selectedTool = "pencil";
let undoStack = [];
let redoStack = [];

function changeTool(tool) {
  // Reset canvas drawing mode and brush
  canvas.isDrawingMode = false;
  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  canvas.freeDrawingBrush.color =
    document.getElementById("brushColor").value;
  canvas.freeDrawingBrush.width = parseInt(
    document.getElementById("brushSize").value,
    10
  );

  // Remove selected class from all buttons
  const buttons = document.querySelectorAll(".toolbar button");
  buttons.forEach((button) => {
    button.classList.remove("selected");
  });

  selectedTool = tool;
  const buttonId = tool + "Button";
  const activeButton = document.getElementById(buttonId);
  activeButton.classList.add("selected");

  switch (tool) {
    case "pencil":
      canvas.isDrawingMode = true;
      break;
    case "brush":
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
      break;
    case "eraser":
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = "white";
      break;
    case "line":
      createLine();
      break;
    case "circle":
      createCircle();
      break;
    case "rectangle":
      createRectangle();
      break;
    case "text":
      createText();
      break;
    case "triangle":
      createTriangle();
      break;
    case "polygon":
      createPolygon();
      break;
    case "select":
      canvas.selection = true;
      break;
    case "fill":
      fillSelectedShape();
      break;
  }
}

function createLine() {
  const line = new fabric.Line([50, 50, 200, 200], {
    stroke: canvas.freeDrawingBrush.color,
    strokeWidth: canvas.freeDrawingBrush.width,
  });
  canvas.add(line);
  addToUndoStack();
}

function createCircle() {
  const circle = new fabric.Circle({
    radius: 50,
    fill: "transparent",
    stroke: canvas.freeDrawingBrush.color,
    strokeWidth: canvas.freeDrawingBrush.width,
    left: 100,
    top: 100,
  });
  canvas.add(circle);
  addToUndoStack();
}

function createRectangle() {
  const rect = new fabric.Rect({
    width: 100,
    height: 100,
    fill: "transparent",
    stroke: canvas.freeDrawingBrush.color,
    strokeWidth: canvas.freeDrawingBrush.width,
    left: 150,
    top: 150,
  });
  canvas.add(rect);
  addToUndoStack();
}

function createText() {
  const text = new fabric.Textbox("Type something...", {
    fontSize: 20,
    fill: canvas.freeDrawingBrush.color,
    left: 200,
    top: 200,
  });
  canvas.add(text);
  addToUndoStack();
}

function createTriangle() {
  const triangle = new fabric.Triangle({
    width: 100,
    height: 100,
    fill: "transparent",
    stroke: canvas.freeDrawingBrush.color,
    strokeWidth: canvas.freeDrawingBrush.width,
    left: 300,
    top: 300,
  });
  canvas.add(triangle);
  addToUndoStack();
}

function createPolygon() {
  const polygon = new fabric.Polygon(
    [
      { x: 50, y: 0 },
      { x: 100, y: 50 },
      { x: 50, y: 100 },
      { x: 0, y: 50 },
    ],
    {
      fill: "transparent",
      stroke: canvas.freeDrawingBrush.color,
      strokeWidth: canvas.freeDrawingBrush.width,
      left: 400,
      top: 400,
    }
  );
  canvas.add(polygon);
  addToUndoStack();
}

function fillSelectedShape() {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.set({
      fill: document.getElementById("brushColor").value,
    });
    canvas.renderAll();
    addToUndoStack();
  }
}

function fillCanvasColor() {
  const fillColor = document.getElementById("brushColor").value;
  canvas.backgroundColor = fillColor;
  canvas.renderAll();
}

function deleteObject() {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.remove(activeObject);
    addToUndoStack();
  }
}

function addToUndoStack() {
  undoStack.push(canvas.toJSON());
  redoStack.length = 0;
}

function undo() {
  if (undoStack.length > 1) {
    redoStack.push(undoStack.pop());
    canvas.loadFromJSON(
      undoStack[undoStack.length - 1],
      canvas.renderAll.bind(canvas)
    );
  }
}

function redo() {
  if (redoStack.length > 0) {
    undoStack.push(redoStack.pop());
    canvas.loadFromJSON(
      undoStack[undoStack.length - 1],
      canvas.renderAll.bind(canvas)
    );
  }
}

function clearCanvas() {
  canvas.clear();
  undoStack.length = 0;
  redoStack.length = 0;
}

function downloadCanvas() {
  const format = prompt("Enter the image format (png, jpg):");
  if (format === "png" || format === "jpg") {
    const dataURL = canvas.toDataURL({
      format: format,
      quality: 1,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "drawing." + format;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert("Invalid format, please enter png or jpg.");
  }
}

document
  .getElementById("brushColor")
  .addEventListener("change", function () {
    canvas.freeDrawingBrush.color = this.value;
  });

document
  .getElementById("brushSize")
  .addEventListener("input", function () {
    canvas.freeDrawingBrush.width = parseInt(this.value, 10);
  });

document
  .getElementById("imageLoader")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const imgObj = new Image();
      imgObj.src = event.target.result;
      imgObj.onload = function () {
        const image = new fabric.Image(imgObj);
        canvas.centerObject(image);
        canvas.add(image);
      };
    };
    reader.readAsDataURL(file);
  });

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "z") {
    undo();
  } else if (event.ctrlKey && event.key === "y") {
    redo();
  }
});

// Initialize with default tool
changeTool(selectedTool);