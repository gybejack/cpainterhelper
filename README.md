# cpainterhelper
A simple script that lets you convert adobe illustrator paths to code compatible with flutter's [CustomPainter](https://api.flutter.dev/flutter/rendering/CustomPainter-class.html)

# How to use it
First set up an illustrator document.
It is very important that you keep in mind the aspect ratio since the script will make every measure proportional.

![Creation Dialog](/images/doccreate.png) 

Then draw your desired shape with the pen tool. The tool now supports paths, compound paths, and even radial and linear gradients!

Here are some examples of admissible paths:

![Example 1, artwork by Giulia Cregut](/images/ex0.png) ![Example 2, transparency and gradients are supported](/images/ex1.png) ![Example 3, compound paths are also now supported](/images/ex2.png) 

Now, select File > Scripts > Other Script... or press ctrl + F12 on your keyboard. Navigate to the script and select it.

![Script menu](/images/menu.png)

The script will create a new text object containing the result.
Each path will be converted to Lines, Quadratic and/ or Cubic Beziers and will automatically be assigned  a [Paint]() for its fill and one for its stroke, if it has one.

![Output](/images/output.png)

The script iterates every path in the current active document. 

The output should look something like this:

```dart
Rect rect = Offset.zero & size; 
//Number 0
Path path0 = Path(); 
/* ... */
canvas.drawPath(path0, spaint0); 

//Number 1
//...
//Number 2
//...
//Number 3
//...


```
You can copy the result inside the [paint](https://api.flutter.dev/flutter/rendering/CustomPainter/paint.html) method of your CustomPainter. Add these to lines on top to make the code work:

```dart
final height = size.height;
final width = size.width;
  ```
Here are the results from the previous examples rendered in flutter

![Example 1](/images/ex0fltr.png) ![Example 2](/images/ex1fltr.png) ![Example 3](/images/ex2fltr.png) 