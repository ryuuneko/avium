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
                    var image = new Image(); 
                    image.src = e.target.result;

                    console.log(image.height);

                    var filters = ['grayscale', 'invert', 'remove-white', 'sepia', 'sepia2',
                      'brightness', 'noise', 'gradient-transparency', 'pixelate',
                      'blur', 'sharpen', 'emboss', 'tint'];
                    var canvas = new fabric.Canvas('img-container');
                    var img = new fabric.Image(image);
                    
                    scaleCoeff = scaleImage(x,y,image.width,image.height); 

                    // alert(scaleCoeff);
                    img.scale(scaleCoeff);
                    canvas.add(img);

// mouse wheel handle

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
                            canvas.renderAll();
                            return false;
                        }
                   });

// mouse wheel handle
                    var f = fabric.Image.filters;

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

                    function applyFilter(idx, filter){
                        var img = canvas.getActiveObject();
                        img.filters[idx]=filter;
                        img.applyFilters(canvas.renderAll.bind(canvas));
                    }

                    $('#grayscale').click(function(){
                        applyFilter(0, this.checked && new f.Grayscale());
                    });

                    $('#invert').click(function() {
                    applyFilter(1, this.checked && new f.Invert());
                    });

                    $('#remove-white').click(function () {
                        applyFilter(2, this.checked && new f.RemoveWhite({
                        threshold: $('#remove-white-threshold').value,
                        distance: $('#remove-white-distance').value
                        }));

                    });

                    // $('remove-white-threshold').change(function() {
                    //     applyFilterValue(2, 'threshold', this.value);
                    // });

                    // $('remove-white-distance').change(function() {
                    //     applyFilterValue(2, 'distance', this.value);
                    // });

                    $('#sepia').click(function() {
                        applyFilter(3, this.checked && new f.Sepia());
                    });

                    $('#sepia2').click(function() {
                        applyFilter(4, this.checked && new f.Sepia2());
                    });

                    $('#brightness').click(function () {
                        applyFilter(5, this.checked && new f.Brightness({
                          brightness: parseInt($('#brightness-value').value, 10)
                        }));
                    });

                    // $('brightness-value').change(function() {
                    //     applyFilterValue(5, 'brightness', parseInt(this.value, 10));
                    // });

                    $('#noise').click(function () {
                        applyFilter(6, this.checked && new f.Noise({
                          noise: parseInt($('#noise-value').value, 10)
                        }));
                    });

                    // $('noise-value').change(function() {
                    //     applyFilterValue(6, 'noise', parseInt(this.value, 10));
                    // });

                    $('#gradient-transparency').click(function () {
                        applyFilter(7, this.checked && new f.GradientTransparency({
                          threshold: parseInt($('#gradient-transparency-value').value, 10)
                        }));
                    });

                    // $('gradient-transparency-value').change(function() {
                    //     applyFilterValue(7, 'threshold', parseInt(this.value, 10));
                    // });

                    $('#pixelate').click(function() {
                        applyFilter(8, this.checked && new f.Pixelate({
                          blocksize: parseInt($('#pixelate-value').value, 10)
                        }));
                    });

                    // $('pixelate-value').change(function() {
                    //     applyFilterValue(8, 'blocksize', parseInt(this.value, 10));
                    // });

                    $('#blur').click(function() {
                        applyFilter(9, this.checked && new f.Convolute({
                          matrix: [ 1/9, 1/9, 1/9,
                                    1/9, 1/9, 1/9,
                                    1/9, 1/9, 1/9 ]
                        }));
                    });

                    $('#sharpen').click(function() {
                        applyFilter(10, this.checked && new f.Convolute({
                          matrix: [  0, -1,  0,
                                    -1,  5, -1,
                                     0, -1,  0 ]
                        }));
                    });

                    $('#emboss').click(function() {
                        applyFilter(11, this.checked && new f.Convolute({
                          matrix: [ 1,   1,  1,
                                    1, 0.7, -1,
                                   -1,  -1, -1 ]
                        }));
                    });

                    $('#tint').click(function() {
                        applyFilter(12, this.checked && new f.Tint({
                          color: document.getElementById('tint-color').value,
                          opacity: parseFloat(document.getElementById('tint-opacity').value)
                        }));
                    });

                    // $('tint-color').change(function() {
                    //     applyFilterValue(12, 'color', this.value);
                    // });

                    // $('tint-opacity').change(function() {
                    //     applyFilterValue(12, 'opacity', parseFloat(this.value));
                    // });
                
                }
                reader.readAsDataURL(f)
            }
        }
    }
    } else {
    alert("Браузер не поддерживает HTML5");
}

});



