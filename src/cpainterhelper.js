alert("Script started");
var myDoc = app.activeDocument;
var docWidth = myDoc.width;
var docHeight = myDoc.height;
var myPaths = myDoc.pathItems;
var result = "";
var xheight = "height * ";
var xwidth = "width * ";

function roundToFour(num) {
    return +(Math.round(num + "e+4") + "e-4");
}

function getPWidth(num) {
    return roundToFour(num / docWidth);
}

function getPHeight(num) {
    return roundToFour(-num / docHeight);
}

function addCubic(pathName, cp1, cp2, target) {
    var res = ""
    res += pathName + ".cubicTo(" + xwidth + getPWidth(cp1[0]) + ", " + xheight + getPHeight(cp1[1]) + ", " + xwidth + getPWidth(cp2[0]) + ", " + xheight + getPHeight(cp2[1]) + ", " + xwidth + getPWidth(target[0]) + ", " + xheight + getPHeight(target[1]) + "); \n";
    return res;
}


for (var i = 0; i < myPaths.length; i++) {
    var invertedIndex = ((myPaths.length - 1) - i);
    var myPath = myPaths[invertedIndex];
    var isClosed = myPath.closed;
    var isFilled = myPath.filled;
    var isStroked = myPath.stroked
    var myPoints = myPath.pathPoints;
    var pathName = "path" + i;
    var paintName = "paint" + i;
    result += "//Number " + i + "\n";
    result += "Path " + pathName + " = Path(); \n";
    result += pathName + ".moveTo(" + xwidth + getPWidth(myPoints[0].anchor[0]) + " , " + xheight + getPHeight(myPoints[0].anchor[1]) + "); \n";
    for (var j = 1; j < myPoints.length; j++) {
        result += addCubic(pathName, myPoints[j - 1].rightDirection, myPoints[j].leftDirection, myPoints[j].anchor);
    }
    if (isClosed) {
        result += addCubic(pathName, myPoints[myPoints.length - 1].rightDirection, myPoints[0].leftDirection, myPoints[0].anchor);
    }
    if (isFilled) {
        var fPaintName = "f" + paintName;
        var bgColor = new RGBColor();
        bgColor = myPath.fillColor;
        result += "Paint " + fPaintName + " = Paint(); \n";
        result += fPaintName + ".color = Color.fromRGBO(" + bgColor.red + ", " + bgColor.green + ", " + bgColor.blue + ", 1.0); \n";

        result += "canvas.drawPath(" + pathName + ", " + fPaintName + "); \n";
    }
    if (isStroked) {
        var sPaintName = "s" + paintName;
        var strokeColor = new RGBColor();
        strokeColor = myPath.strokeColor;
        var strokeCap = myPath.strokeCap;
        var strokeJoin = myPath.strokeJoin;
        var strokeWidth = myPath.strokeWidth;
        var strokeMiterLimit = myPath.strokeMiterLimit;
        result += "Paint " + sPaintName + " = Paint(); \n";
        result += sPaintName + ".color = Color.fromRGBO(" + strokeColor.red + ", " + strokeColor.green + ", " + strokeColor.blue + ", 1.0); \n";
        result += sPaintName + ".strokeWidth = " + strokeWidth + "; \n";
        result += sPaintName + ".style = PaintingStyle.stroke; \n";

        result += "canvas.drawPath(" + pathName + ", " + sPaintName + "); \n";
    }
    result += "\n";
}
var myText = myDoc.textFrames.pointText([0, 0]);
myText.contents = result;
alert(result);