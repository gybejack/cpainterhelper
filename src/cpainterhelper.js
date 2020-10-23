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
    var res = "";
    res += pathName + ".cubicTo(" + xwidth + getPWidth(cp1[0]) + ", " + xheight + getPHeight(cp1[1]) + ", " + xwidth + getPWidth(cp2[0]) + ", " + xheight + getPHeight(cp2[1]) + ", " + xwidth + getPWidth(target[0]) + ", " + xheight + getPHeight(target[1]) + "); \n";
    return res;
}

function addColor(color, opacity) {
    var res = "";
    if (color.typename == "RGBColor") {
        res = "Color.fromRGBO(" + color.red + ", " + color.green + ", " + color.blue + ", " + opacity / 100 + ")";
    } else if (color.typename == "GrayColor") {
        var gray = 255 - (color.gray * 2.55);
        res = "Color.fromRGBO(" + gray + ", " + gray + ", " + gray + ", " + opacity / 100 + ")";
    } else {
        alert("unrecognized color type!");
    }

    return res;

}
result += "Rect rect = Offset.zero & size; \n";
for (var i = 0; i < myPaths.length; i++) {
    var invertedIndex = ((myPaths.length - 1) - i);
    var myPath = myPaths[invertedIndex];
    var isClosed = myPath.closed;
    var isFilled = myPath.filled;
    var isStroked = myPath.stroked
    var opacity = myPath.opacity;
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
        var bgColor;
        bgColor = myPath.fillColor;
        result += "Paint " + fPaintName + " = Paint(); \n";
        if (bgColor.typename == "RGBColor") {
            result += fPaintName + ".color = " + addColor(bgColor, opacity) + "; \n";
        } else if (bgColor.typename == "GradientColor") {
            var gradientName = "fgradient" + i;
            if (bgColor.gradient.type == "GradientType.RADIAL") {
                alert(bgColor.origin);
                var gcolors = [];
                var gstops = [];
                for (var k = 0; k < bgColor.gradient.gradientStops.length; k++) {
                    var myStop = bgColor.gradient.gradientStops[k];
                    var newColor = addColor(myStop.color, myStop.opacity);
                    gcolors.push(newColor);
                    var newRampStop = "";
                    newRampStop += myStop.rampPoint / 100;
                    gstops.push(newRampStop);
                }
                result += "var " + gradientName + " = RadialGradient(\ncenter: const Alignment(";
                result += (getPWidth(bgColor.origin[0]) * 2 - 1) + ", " + (getPHeight(bgColor.origin[1]) * 2 - 1) + "), \n";
                result += "radius: " + bgColor.length / 1000 + ", \n";
                alert(bgColor.length);
                result += "colors: [\n";
                for (var k = 0; k < gcolors.length; k++) {
                    result += gcolors[k] + ", \n";
                }
                result += "], \n"
                result += "stops: ["
                for (var k = 0; k < gstops.length; k++) {
                    result += gstops[k] + ", ";
                }
                result += "],\n);\n";
                result += fPaintName + ".shader = " + gradientName + ".createShader(rect); \n";

            }

        }


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
        result += sPaintName + ".color = " + addColor(strokeColor, opacity) + "; \n";
        result += sPaintName + ".strokeWidth = " + strokeWidth + "; \n";
        if (strokeJoin != "StrokeJoin.MITERENDJOIN") {
            isRound = strokeJoin == "StrokeJoin.ROUNDENDJOIN";
            result += sPaintName + ".strokeJoin = " + (isRound ? "StrokeJoin.round" : "StrokeJoin.bevel") + "; \n";
        }
        if (strokeCap != "StrokeCap.BUTTENDCAP") {
            isRound = strokeCap == "StrokeCap.ROUNDENDCAP";
            result += sPaintName + ".strokeCap = " + (isRound ? "StrokeCap.round" : "StrokeCap.square") + "; \n";
        }
        result += sPaintName + ".strokeMiterLimit = " + strokeMiterLimit + "; \n"; //TODO
        result += sPaintName + ".style = PaintingStyle.stroke; \n";

        result += "canvas.drawPath(" + pathName + ", " + sPaintName + "); \n";
    }
    result += "\n";
}
var myText = myDoc.textFrames.pointText([0, 0]);
myText.contents = result;
alert(result);