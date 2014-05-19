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
            if (document.getElementById('img-container').childNodes.length<10){
                var reader = new FileReader();
                reader.onload = function(e){
                    var imageLeft, imageTop, imageScale;
                    var image = new Image(); 
                    var ch, cw;
                    image.src = e.target.result;
                    console.log(image.src);


                    var filters = ['grayscale', 'invert', 'remove-white', 'sepia', 'sepia2',
                      'brightness', 'noise', 'gradient-transparency', 'pixelate',
                      'blur', 'sharpen', 'emboss', 'tint'];
                    
function create(image,left,top,scaleCoeff){
    console.log(image.src);
                    var canvas = new fabric.Canvas('img-container');
                    ch = canvas.height;
                    cw = canvas.width;
                    var img = new fabric.Image(image,{
                        left:left,
                        top:top
                    });
                    
                    if (typeof(scaleCoeff) == 'undefined'){
                        scaleCoeff = scaleImage(x,y,image.width,image.height); 
                    }

                    img.scale(scaleCoeff);
                    canvas.add(img);
                    canvas.item(0).hasControls = false;
                    canvas.renderAll();
initMouseWheel(canvas);
return canvas;

}
canvas = create(image,0,0);


canvas.on("object:moving", function(e){
    imageLeft = e.target.left;
    imageTop = e.target.top;
    // console.log(e.target.width);
})


function recreateCanvas(){
    $(".canvas-container").remove();
    var nc = document.createElement("canvas");
    nc.setAttribute('id','img-container');
    nc.setAttribute("width",cw);
    nc.setAttribute("height",ch);
    $('body').append(nc);
}


// apply filters to image
                    $('#apply').click(function(){
                        var Scale = imageScale;
                        canvas.setActiveObject(canvas.item(0));
                        img = canvas.getActiveObject();

                        // if (typeof(Scale) == "undefined"){
                            // Scale = scaleCoeff;
                        // }

                        // console.log(Scale);
                        img.left = 0;
                        img.top = 0;
                        img.scale(1);
                        canvas.width = image.width;
                        canvas.height = image.height;
                        var imgSaved = canvas.toDataURL("image/png");
                        console.log("saved:",imgSaved);

                        // recreateCanvas();
                        // image = new Image(); 
                        // image.src = (imgSaved);
                        // applyedFilters = Array();
                        // canvas = create(image,imageLeft,imageTop);
                        // canvas.setActiveObject(canvas.item(0));
                        // canvas.renderAll();

                    })
// apply filters to image

//////////////////////////////// image crop

$('#imageCrop').click(function(){

    function showCoords(c){
        console.log("x1:",c.x,"y1:",c.y);
        console.log("x2:",c.x2,"y2:",c.y2);
        console.log(canvas.item(0));
    }


    var jcrop_api = $.Jcrop('canvas', {
        bgColor: 'black',
        bgOpacity: .3
    });          

    $("#cancel").click(function(e){
        jcrop_api.release();
        console.log(canvas.wrapperEl);
        jcrop_api.disable();
        jcrop_api.destroy();
        recreateCanvas();
        canvas = create(image,imageLeft,imageTop, imageScale);
        canvas.setActiveObject(canvas.item(0));
        for (key in applyedFilters){
            console.log(applyedFilters[key], key);
            applyFilter(key, applyedFilters[key]);
        console.log(canvas.wrapperEl);
        
        }
    });  


    $("#crop").click(function(e){
        console.log(jcrop_api.tellSelect());
    });           

}); // image crop


// mouse wheel handle

function initMouseWheel(canvas){
                   $(canvas.wrapperEl).on('mousewheel', function(e){
                         var target = canvas.findTarget(e);
                         // console.log(e.originalEvent.wheelDelta);
                        var delta = e.originalEvent.wheelDelta / 1200;
                        // console.log(delta);
                         if (target) {
                            target.scaleX += delta;
                            target.scaleY += delta;
                            
                            // constrain
                            if (target.scaleX < 0.1) {
                                target.scaleX = 0.1;
                                target.scaleY = 0.1;
                            }
                            // constrain
                            if (target.scaleX > 10) {
                                target.scaleX = 10;
                                target.scaleY = 10;
                            }
                            target.setCoords();
                            imageScale = target.scaleX;
                            // console.log(imageScale);
                            canvas.renderAll();
                            return false;
                        }
                   });
}
// mouse wheel handle

                    function scaleImage(x,y,ix,iy){
                        scaleCoeffX = x/ix;
                        scaleCoeffY = y/iy;
                        if (scaleCoeffX>scaleCoeffY){
                            scaleCoeff = scaleCoeffY;
                        }
                        else{
                            scaleCoeff = scaleCoeffX;
                        }
                        return scaleCoeff;
                    }

                    var f = fabric.Image.filters;





////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//////////////////////////              ////////////////////////////////////////////
////////////////////////    _FILTERS_    ///////////////////////////////////////////
/////////////////////////              /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
var applyedFilters = new Array();


                    function applyFilter(idx, filter){
                        var img = canvas.getActiveObject();
                        img.filters[idx]=filter;
                        img.applyFilters(canvas.renderAll.bind(canvas));
                        applyedFilters[idx] = filter;
                        // console.log(img.src);
                    }


                    function applyFilterValue(index, prop, value) {
                        var obj = canvas.getActiveObject();
                        if (obj.filters[index]) {
                          obj.filters[index][prop] = value;
                          obj.applyFilters(canvas.renderAll.bind(canvas));
                        }
                      }

// grayscale filter
                    $('#grayscale').click(function(){
                        applyFilter(0, this.checked && new f.Grayscale());
                    });
//grayscale filter

// colorinversion filter
                    $('#invert').click(function() {
                    applyFilter(1, this.checked && new f.Invert());
                    });
//colorinversion filter

// remove white filter
                    $('#remove-white').click(function () {
                        applyFilter(2, this.checked && new f.RemoveWhite({
                        threshold: $('#remove-white-threshold').value,
                        distance: $('#remove-white-distance').value
                        }));

                    });

                    $('#remove-white-threshold').change(function() {
                        applyFilterValue(2, 'threshold', this.value);
                    });

                    $('#remove-white-distance').change(function() {
                        applyFilterValue(2, 'distance', this.value);
                    });
// remove white filter

// sepia first version filter
                    $('#sepia').click(function() {
                        applyFilter(3, this.checked && new f.Sepia());
                    });
//sepia first version filter

//sepia second version filter
                    $('#sepia2').click(function() {
                        applyFilter(4, this.checked && new f.Sepia2());
                    });
// sepia second version filter

//brightness filter
                    $('#brightness').click(function () {
                        applyFilter(5, this.checked && new f.Brightness({
                          brightness: parseInt($('#brightness-value').value, 10)
                        }));
                    });

                    $('#brightness-value').change(function() {
                        applyFilterValue(5, 'brightness', parseInt(this.value, 10));
                    });
//brightness filter


//noise filter
                    $('#noise').click(function () {
                        applyFilter(6, this.checked && new f.Noise({
                          noise: parseInt($('#noise-value').value, 10)
                        }));
                    });

                    $('#noise-value').change(function() {
                        applyFilterValue(6, 'noise', parseInt(this.value, 10));
                    });
//noise filter


// gradient transparency filter
                    $('#gradient-transparency').click(function () {
                        applyFilter(7, this.checked && new f.GradientTransparency({
                          threshold: parseInt($('#gradient-transparency-value').value, 10)
                        }));
                    });

                    $('#gradient-transparency-value').change(function() {
                        applyFilterValue(7, 'threshold', parseInt(this.value, 10));
                    });
// gradient transparency filter

// pixelate filter
                    $('#pixelate').click(function() {
                        applyFilter(8, this.checked && new f.Pixelate({
                          blocksize: parseInt($('#pixelate-value').value, 10)
                        }));
                    });

                    $('#pixelate-value').change(function() {
                        applyFilterValue(8, 'blocksize', parseInt(this.value, 10));
                    });
// pixelate filter

// blur filter
                    $('#blur').click(function() {
                        applyFilter(9, this.checked && new f.Convolute({
                          matrix: [ 1/9, 1/9, 1/9,
                                    1/9, 1/9, 1/9,
                                    1/9, 1/9, 1/9 ]
                        }));
                    });
// blur filter


// sharpen filter
                    $('#sharpen').click(function() {
                        applyFilter(10, this.checked && new f.Convolute({
                          matrix: [  0, -1,  0,
                                    -1,  5, -1,
                                     0, -1,  0 ]
                        }));
                    });
// sharpen filter


// embos filter
                    $('#emboss').click(function() {
                        applyFilter(11, this.checked && new f.Convolute({
                          matrix: [ 1,   1,  1,
                                    1, 0.7, -1,
                                   -1,  -1, -1 ]
                        }));
                    });
// embos filter


// tint filter
                    $('#tint').click(function() {
                        applyFilter(12, this.checked && new f.Tint({
                          color: document.getElementById('tint-color').value,
                          opacity: parseFloat(document.getElementById('tint-opacity').value)
                        }));
                    });

                    $('#tint-color').change(function() {
                        applyFilterValue(12, 'color', this.value);
                    });

                    $('#tint-opacity').change(function() {
                        applyFilterValue(12, 'opacity', parseFloat(this.value));
                    });
// tint filter

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
//////////////////////////              ////////////////////////////////////////////
////////////////////////    _FILTERS_    ///////////////////////////////////////////
/////////////////////////              /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

                }
                reader.readAsDataURL(f)
            }
        }
    }
    } else {
    alert("Браузер не поддерживает HTML5");
}

});



