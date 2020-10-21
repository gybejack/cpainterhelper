# cpainterhelper
A simple script that lets you convert adobe illustrator paths to code compatible with flutter's [CustomPainter](https://api.flutter.dev/flutter/rendering/CustomPainter-class.html)
# How to use it
First set up an illustrator document.
It is very important that you keep in mind the aspect ratio since the script will make every measure proportional.
![Creation Dialog](/images/doccreate.png) 

Then draw your desired shape with the pen tool. At the moment only strokes / filled paths are supported (no fancy clipping paths or other advanced illustrator features). Feel free to contribute to the repository if you want.

Here are some examples of admissible paths:
![Example 1](/images/ex0.png) ![Example 2](/images/ex1.png) ![Example 3](/images/ex2.png) 

Now, select File > Scripts > Other Script... or press ctrl + F12 on your keyboard. Navigate to the script and select it.
![Script menu](/images/menu.png)

The script will create a new text object containing the result.
Each path will be converted to [cubicCurve]()s and will automatically be assigned  a [Paint]() for its fill and one for its stroke, if it has one.
![Output](/images/output.png)

The script iterates every path in the current active document. At the moment the order of output does not reflect the actual layers, so you'll have to adjust them yourself.

The output should look something like this:

```dart
//Number 0
Path path0 = Path(); 
path0.moveTo(width * 0.12 , height * 0.48); 
path0.cubicTo(width * 0.12, height * 0.48, width * 0.64, height * 0.52, width * 0.68, height * 0.52); 
/*
...
*/
canvas.drawPath(path0, spaint0); 

//Number 1
Path path1 = Path(); 
path1.moveTo(width * 0.2 , height * 0.36); 
path1.cubicTo(width * 0.25, height * 0.4, width * 0.45, height * 0.38, width * 0.48, height * 0.38); 
/*
...
*/
canvas.drawPath(path1, spaint1); 

//Number 2
Path path2 = Path(); 
path2.moveTo(width * 0.17 , height * 0.25); 
path2.cubicTo(width * 0.36, height * 0.26, width * 0.37, height * 0.26, width * 0.43, height * 0.22); 
/*
...
*/
canvas.drawPath(path2, spaint2); 
```
You can copy the result inside the [paint](https://api.flutter.dev/flutter/rendering/CustomPainter/paint.html) method of your CustomPainter. Add these to lines on top to make the code work:

```dart
final height = size.height;
final width = size.width;
  ```
Here are the results from the previous examples rendered in flutter
![Example 1](/images/ex0fltr.png) ![Example 2](/images/ex1fltr.png) ![Example 3](/images/ex2fltr.png) 