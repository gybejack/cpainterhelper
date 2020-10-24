alert("Script started");
var myDoc = app.activeDocument;
var docWidth = myDoc.width;
var docHeight = myDoc.height;
var myPaths = myDoc.pathItems;
var myCompoundPaths = myDoc.compoundPathItems;
var myCompoundPathsLengths = [];
for (var i = 0; i < myCompoundPaths.length; i++) {
    var invertedIndex = ((myCompoundPaths.length - 1) - i);
    var myCPath = myCompoundPaths[invertedIndex];
    var cPathLength = myCPath.pathItems.length;
    myCompoundPathsLengths.push(cPathLength);
}
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

function checkArrayEqual(arr1, arr2) {
    return arr1[0] == arr2[0] && arr1[1] == arr2[1];
}

function addCubic(pathName, cp1, cp2, target) {
    var res = "";
    res += pathName + ".cubicTo(" + xwidth + getPWidth(cp1[0]) + ", " + xheight + getPHeight(cp1[1]) + ", " + xwidth + getPWidth(cp2[0]) + ", " + xheight + getPHeight(cp2[1]) + ", " + xwidth + getPWidth(target[0]) + ", " + xheight + getPHeight(target[1]) + "); \n";
    return res;
}

function addQuadratic(pathName, cp, target) {
    var res = "";
    res += pathName + ".quadraticBezierTo(" + xwidth + getPWidth(cp[0]) + ", " + xheight + getPHeight(cp[1]) + ", " + xwidth + getPWidth(target[0]) + ", " + xheight + getPHeight(target[1]) + "); \n";
    return res;
}

function addLine(pathName, target) {
    var res = "";
    res += pathName + ".lineTo(" + xwidth + getPWidth(target[0]) + ", " + xheight + getPHeight(target[1]) + "); \n";
    return res;
}

function addPathSegment(pathName, origin, target) {
    var originAnchor = origin.anchor;
    var cp1 = origin.rightDirection;
    var cp2 = target.leftDirection;
    var targetAnchor = target.anchor;
    if (!checkArrayEqual(originAnchor, cp1) && !checkArrayEqual(targetAnchor, cp2)) {
        return addCubic(pathName, cp1, cp2, targetAnchor);
    } else if (checkArrayEqual(originAnchor, cp1) && checkArrayEqual(targetAnchor, cp2)) {
        return addLine(pathName, targetAnchor);
    } else if (checkArrayEqual(originAnchor, cp1)) {
        return addQuadratic(pathName, cp2, targetAnchor);
    } else {
        return addQuadratic(pathName, cp1, targetAnchor);
    }
}

function addColor(color, opacity) {
    var res = "";
    if (color.typename == "RGBColor") {
        res = "Color.fromRGBO(" + color.red + ", " + color.green + ", " + color.blue + ", " + opacity / 100 + ")";
    } else if (color.typename == "GrayColor") {
        var gray = Math.round(255 - (color.gray * 2.55));
        res = "Color.fromRGBO(" + gray + ", " + gray + ", " + gray + ", " + opacity / 100 + ")";
    } else {
        alert("unrecognized color type!");
    }
    return res;
}

result += "Rect rect = Offset.zero & size; \n";

var currentCompoundPath = 0;
var currentCompoundPathComponent = 0;
var pathName = "";
var paintName = "";
for (var i = 0; i < myPaths.length; i++) {
    var invertedIndex = ((myPaths.length - 1) - i);
    var myPath = myPaths[invertedIndex];
    var isCompound = myPath.parent.typename == "CompoundPathItem";
    var isClosed = myPath.closed;
    var isFilled = myPath.filled;
    var isStroked = myPath.stroked;
    var opacity = myPath.opacity;
    var myPoints = myPath.pathPoints;
    if (!isCompound || currentCompoundPathComponent == 0) {
        pathName = "path" + i;
        paintName = "paint" + i;
        result += "//Number " + i + "\n";
        result += "Path " + pathName + " = Path(); \n";
    }
    result += pathName + ".moveTo(" + xwidth + getPWidth(myPoints[0].anchor[0]) + " , " + xheight + getPHeight(myPoints[0].anchor[1]) + "); \n";
    for (var j = 1; j < myPoints.length; j++) {
        result += addPathSegment(pathName, myPoints[j - 1], myPoints[j]);
    }
    if (isClosed) {
        result += addPathSegment(pathName, myPoints[myPoints.length - 1], myPoints[0]);
    }
    if (!isCompound || currentCompoundPathComponent == myCompoundPathsLengths[currentCompoundPath] - 1) {
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
    }
    if (isCompound) {
        if (currentCompoundPathComponent == myCompoundPathsLengths[currentCompoundPath] - 1) {
            currentCompoundPath += 1;
            currentCompoundPathComponent = 0;
        } else {
            currentCompoundPathComponent += 1;
        }
    }
    result += "\n";
}
var myText = myDoc.textFrames.pointText([0, 0]);
myText.contents = result;
alert(result);