$(document).ready(function(){
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

var dropBox = document.getElementById('img-container');
dropBox.width = x; dropBox.height = y;

function ge(elem){
    return document.getElementById(elem);
}

if (window.File && window.FileReader && window.FileList && window.Blob){

    dropBox.addEventListener('dragover', handleFileOver, false);
    dropBox.addEventListener('drop', handleFileSelect, false);

    function handleFileOver(event){
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    function handleFileSelect(event){
        event.preventDefault();
        var files = event.target.files;

        if (typeof (files) == "undefined"){
            var files = event.dataTransfer.files;
        }
        
        var output = [];
        for(var i= 0, f;f=files[i];i++){
//            f = files[i];
//            alert(document.getElementById('img-container').childNodes.length);
//            alert(i);
            if (document.getElementById('img-container').childNodes.length<10){
                var reader = new FileReader();
                reader.onload = function(e){
                    // alert(dropBox.offsetWidth+"|"+dropBox.offsetHeight);


                    var context = dropBox.getContext('2d');
                    trackTransforms(context);
                    var image = new Image(); 
                    image.src = e.target.result;
                    
// ##################################################################################
        function redraw(){
            var p1 = context.transformedPoint(0,0);
            var p2 = context.transformedPoint(dropBox.width,dropBox.height);
            context.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
            context.drawImage(image,200,50);
        }

        redraw();
        
        var lastX=dropBox.width/2, lastY=dropBox.height/2;
        var dragStart,dragged;
        dropBox.addEventListener('mousedown',function(evt){
            document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
            lastX = evt.offsetX || (evt.pageX - dropBox.offsetLeft);
            lastY = evt.offsetY || (evt.pageY - dropBox.offsetTop);
            dragStart = context.transformedPoint(lastX,lastY);
            dragged = false;
        },false);
        dropBox.addEventListener('mousemove',function(evt){
            lastX = evt.offsetX || (evt.pageX - dropBox.offsetLeft);
            lastY = evt.offsetY || (evt.pageY - dropBox.offsetTop);
            dragged = true;
            if (dragStart){
                var pt = context.transformedPoint(lastX,lastY);
                context.translate(pt.x-dragStart.x,pt.y-dragStart.y);
                redraw();
            }
        },false);
        dropBox.addEventListener('mouseup',function(evt){
            dragStart = null;
            if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
        },false);

        var scaleFactor = 1.1;
        var zoom = function(clicks){
            var pt = context.transformedPoint(lastX,lastY);
            context.translate(pt.x,pt.y);
            var factor = Math.pow(scaleFactor,clicks);
            context.scale(factor,factor);
            context.translate(-pt.x,-pt.y);
            redraw();
        }

        var handleScroll = function(evt){
            var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
            if (delta) zoom(delta);
            return evt.preventDefault() && false;
        };
        dropBox.addEventListener('DOMMouseScroll',handleScroll,false);
        dropBox.addEventListener('mousewheel',handleScroll,false);
    
    
    // Adds context.getTransform() - returns an SVGMatrix
    // Adds context.transformedPoint(x,y) - returns an SVGPoint
    function trackTransforms(context){
        var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        var xform = svg.createSVGMatrix();
        context.getTransform = function(){ return xform; };
        
        var savedTransforms = [];
        var save = context.save;
        context.save = function(){
            savedTransforms.push(xform.translate(0,0));
            return save.call(context);
        };
        var restore = context.restore;
        context.restore = function(){
            xform = savedTransforms.pop();
            return restore.call(context);
        };

        var scale = context.scale;
        context.scale = function(sx,sy){
            xform = xform.scaleNonUniform(sx,sy);
            return scale.call(context,sx,sy);
        };
        var rotate = context.rotate;
        context.rotate = function(radians){
            xform = xform.rotate(radians*180/Math.PI);
            return rotate.call(context,radians);
        };
        var translate = context.translate;
        context.translate = function(dx,dy){
            xform = xform.translate(dx,dy);
            return translate.call(context,dx,dy);
        };
        var transform = context.transform;
        context.transform = function(a,b,c,d,e,f){
            var m2 = svg.createSVGMatrix();
            m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
            xform = xform.multiply(m2);
            return transform.call(context,a,b,c,d,e,f);
        };
        var setTransform = context.setTransform;
        context.setTransform = function(a,b,c,d,e,f){
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(context,a,b,c,d,e,f);
        };
        var pt  = svg.createSVGPoint();
        context.transformedPoint = function(x,y){
            pt.x=x; pt.y=y;
            return pt.matrixTransform(xform.inverse());
        }
    }
// ##################################################################################
                }
                reader.readAsDataURL(f)
            }
        }
    }
    } else {
    alert("Браузер не поддерживает HTML5");
}

});



