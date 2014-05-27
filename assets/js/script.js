fabric.Image.filters.BrightnessContrast = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
    type: "BrightnessContrast",
    initialize: function(options) {
        options || (options = { });
        this.contrast = options.contrast || 0;
        this.brightness = options.brightness || 0;
    },
    applyTo: function(canvasEl) {
        var brightMul = 1 + Math.min(150,Math.max(-150,this.brightness)) / 150,
            contrast = Math.max(0,this.contrast+1),
            context = canvasEl.getContext("2d"),
            imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
            data = imageData.data,
            p = canvasEl.width * canvasEl.height,
            pix = p*4, pix1, pix2, mul, add, r, g, b;

        if (contrast != -1) {
            mul = brightMul * contrast;
            add = - contrast * 128 + 128;
        }
        else {
            mul = brightMul;
            add = 0;
        }

        while (p--) {
            if ((r = data[pix-=4] * mul + add) > 255 )
                data[pix] = 255;
            else if (r < 0)
                data[pix] = 0;
            else
                data[pix] = r;

            if ((g = data[pix1=pix+1] * mul + add) > 255 )
                data[pix1] = 255;
            else if (g < 0)
                data[pix1] = 0;
            else
                data[pix1] = g;

            if ((b = data[pix2=pix+2] * mul + add) > 255 )
                data[pix2] = 255;
            else if (b < 0)
                data[pix2] = 0;
            else
                data[pix2] = b;
        }

        context.putImageData(imageData, 0, 0);
    },

    toObject: function() {
        return extend(this.callSuper("toObject"), {
            "contrast": this.contrast,
            "brightness": this.brightness
        });
    }
});

fabric.Image.filters.HSL = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
    type: "HSL",
    initialize: function(options) {
        options || (options = { });
        this.hue = options.hue || 0;
        this.saturation = options.saturation || 0;
        this.lightness = options.lightness || 0;
    },
    applyTo: function(canvasEl) {
        var hue = parseInt(this.hue, 10)||0;
        var saturation = (parseInt(this.saturation, 10)||0) / 100;
        var lightness = (parseInt(this.lightness, 10)||0) / 100;

        var context = canvasEl.getContext("2d"),
            imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
            data = imageData.data,
            p = canvasEl.width * canvasEl.height;

        // this seems to give the same result as Photoshop
        if (saturation < 0) {
            var satMul = 1+saturation;
        } else {
            var satMul = 1+saturation*2;
        }

        hue = (hue%360) / 360;
        var hue6 = hue * 6;

        var rgbDiv = 1 / 255;

        var light255 = lightness * 255;
        var lightp1 = 1 + lightness;
        var lightm1 = 1 - lightness;

        var pix = p*4, pix1 = pix + 1, pix2 = pix + 2, pix3 = pix + 3;

        while (p--) {

            var r = data[pix-=4];
            var g = data[pix1=pix+1];
            var b = data[pix2=pix+2];

            if (hue != 0 || saturation != 0) {
                // ok, here comes rgb to hsl + adjust + hsl to rgb, all in one jumbled mess. 
                // It"s not so pretty, but it"s been optimized to get somewhat decent performance.
                // The transforms were originally adapted from the ones found in Graphics Gems, but have been heavily modified.
                var vs = r;
                if (g > vs) vs = g;
                if (b > vs) vs = b;
                var ms = r;
                if (g < ms) ms = g;
                if (b < ms) ms = b;
                var vm = (vs-ms);
                var l = (ms+vs)/510;
                if (l > 0) {
                    if (vm > 0) {
                        if (l <= 0.5) {
                            var s = vm / (vs+ms) * satMul;
                            if (s > 1) s = 1;
                            var v = (l * (1+s));
                        } else {
                            var s = vm / (510-vs-ms) * satMul;
                            if (s > 1) s = 1;
                            var v = (l+s - l*s);
                        }
                        if (r == vs) {
                            if (g == ms)
                                var h = 5 + ((vs-b)/vm) + hue6;
                            else
                                var h = 1 - ((vs-g)/vm) + hue6;
                        } else if (g == vs) {
                            if (b == ms)
                                var h = 1 + ((vs-r)/vm) + hue6;
                            else
                                var h = 3 - ((vs-b)/vm) + hue6;
                        } else {
                            if (r == ms)
                                var h = 3 + ((vs-g)/vm) + hue6;
                            else
                                var h = 5 - ((vs-r)/vm) + hue6;
                        }
                        if (h < 0) h+=6;
                        if (h >= 6) h-=6;
                        var m = (l+l-v);
                        var sextant = h>>0;
                        if (sextant == 0) {
                            r = v*255; g = (m+((v-m)*(h-sextant)))*255; b = m*255;
                        } else if (sextant == 1) {
                            r = (v-((v-m)*(h-sextant)))*255; g = v*255; b = m*255;
                        } else if (sextant == 2) {
                            r = m*255; g = v*255; b = (m+((v-m)*(h-sextant)))*255;
                        } else if (sextant == 3) {
                            r = m*255; g = (v-((v-m)*(h-sextant)))*255; b = v*255;
                        } else if (sextant == 4) {
                            r = (m+((v-m)*(h-sextant)))*255; g = m*255; b = v*255;
                        } else if (sextant == 5) {
                            r = v*255; g = m*255; b = (v-((v-m)*(h-sextant)))*255;
                        }
                    }
                }
            }

            if (lightness < 0) {
                r *= lightp1;
                g *= lightp1;
                b *= lightp1;
            } else if (lightness > 0) {
                r = r * lightm1 + light255;
                g = g * lightm1 + light255;
                b = b * lightm1 + light255;
            }

            if (r < 0) 
                data[pix] = 0
            else if (r > 255)
                data[pix] = 255
            else
                data[pix] = r;

            if (g < 0) 
                data[pix1] = 0
            else if (g > 255)
                data[pix1] = 255
            else
                data[pix1] = g;

            if (b < 0) 
                data[pix2] = 0
            else if (b > 255)
                data[pix2] = 255
            else
                data[pix2] = b;
        }
        context.putImageData(imageData, 0, 0);
    },
    toObject: function() {
        return extend(this.callSuper("toObject"), {
            "hue": this.hue,
            "saturation": this.saturation,
            "lightness": this.lightness
        });
    }
});

fabric.Image.filters.SepiaTone = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
    type: "SepiaTone",
    initialize: function(options) {
        options || (options = { });
        this.mode = options.mode || 0;
    },
    applyTo: function(canvasEl) {
        var mode = (parseInt(this.mode,10)||0);
        if (mode < 0) mode = 0;
        if (mode > 1) mode = 1;

        var context = canvasEl.getContext("2d"),
            imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
            data = imageData.data,
            w = canvasEl.width,
            h = canvasEl.height,
            w4 = w*4,
            y = h;

        do {
            var offsetY = (y-1)*w4;
            var x = w;
            do {
                var offset = offsetY + (x-1)*4;

                if (mode) {
                    // a bit faster, but not as good
                    var d = data[offset] * 0.299 + data[offset+1] * 0.587 + data[offset+2] * 0.114;
                    var r = (d + 39);
                    var g = (d + 14);
                    var b = (d - 36);
                } else {
                    // Microsoft
                    var or = data[offset];
                    var og = data[offset+1];
                    var ob = data[offset+2];
        
                    var r = (or * 0.393 + og * 0.769 + ob * 0.189);
                    var g = (or * 0.349 + og * 0.686 + ob * 0.168);
                    var b = (or * 0.272 + og * 0.534 + ob * 0.131);
                }

                if (r < 0) r = 0; if (r > 255) r = 255;
                if (g < 0) g = 0; if (g > 255) g = 255;
                if (b < 0) b = 0; if (b > 255) b = 255;

                data[offset] = r;
                data[offset+1] = g;
                data[offset+2] = b;

            } while (--x);
        } while (--y);
        context.putImageData(imageData, 0, 0);
    },
    toObject: function() {
        return extend(this.callSuper("toObject"), {
            "mode": this.mode,
        });
    }
});

$(function() {
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    var croped=false;
    var dropBox = document.getElementById("c");
    dropBox.width = x; dropBox.height = y;
    console.log(dropBox)
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        alert("Браузер не поддерживает HTML5");
        return false;
    }

    dropBox.addEventListener("dragover", handleFileEnter, false);
    dropBox.addEventListener("dragenter", handleFileEnter, false);
    dropBox.addEventListener("drop", handleFileSelect, false);

    $("#upload").on("change", function(e) {
        handleFileSelect(e);
        $("#canvas").find(".drop").addClass("show");
        $("#canvas").find(".upper-canvas ").remove();
        canvas.item(0).remove();
        return false;
    });

    function handleFileEnter(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    }

    function handleFileSelect(e) {
        e.preventDefault();
        var files = e.target.files || e.dataTransfer.files;;

        var file = files[0];

        console.log(files);


        var output = [];
        var reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function(e) {
            var imageLeft,
                imageTop,
                imageScale;
            var image = new Image(); 
            var ch, cw;
            image.src = e.target.result;
            console.log(image.src);

            $("#canvas").find(".drop").removeClass("show");

            var filters = ["grayscale", "invert", "remove-white", "sepia", "sepia2", "brightness", "noise", "gradient-transparency", "pixelate", "blur", "sharpen", "emboss", "tint", "brightness-contrast", "hsl", "sepia-tone"];

            function create(image, left, top, scaleCoeff) {
                console.log(image.src);
                var canvas = new fabric.Canvas("c");
                
                canvas.selection = false;

                ch = canvas.height;
                cw = canvas.width;
                var img = new fabric.Image(image,{
                    "left": cw / 2,
                    "top": ch / 2,
                    "originX": "center",
                    "originY": "center"
                });

                if (typeof(scaleCoeff) == "undefined"){
                    scaleCoeff = scaleImage(x,y,image.width,image.height); 
                }

                img.scale(scaleCoeff);
                canvas.add(img);
                canvas.item(0).hasControls = false;
                canvas.item(0).borderColor = "transparent";
                canvas.setActiveObject(canvas.item(0));
                canvas.renderAll();
                initMouseWheel(canvas);
                return canvas;
            }
            canvas = create(image, 0, 0);


            canvas.on("object:moving", function(e){
                imageLeft = e.target.left;
                imageTop = e.target.top;
            });


            function recreateCanvas() {
                $(".canvas-container").remove();
                var nc = document.createElement("canvas");
                nc.setAttribute("id","c");
                nc.setAttribute("width",cw);
                nc.setAttribute("height",ch);
                $("#canvas").append(nc);
            }

            $("#new").click(function(){
                $("#canvas").find(".drop").addClass("show");
                $("#canvas").find(".upper-canvas ").remove();
                $("#invert").prop('checked',false);
                $("#grayscale").prop('checked',false);
                $("#hsl").prop('checked',false);
                $("#brightness").prop('checked',false);
                $("#rotate").prop('checked',false);
                $("#flipx").prop('checked',false);
                $("#flipy").prop('checked',false);
                $("#sepia").prop('checked',false);
                $("#blur").prop('checked',false);
                $("#sharpen").prop('checked',false);
                $("#emboss").prop('checked',false);
                canvas.item(0).remove();
            });

            $("#save").click(function() {
                var Scale = imageScale;
                canvas.setActiveObject(canvas.item(0));
                img = canvas.getActiveObject();

                var ch = canvas.height,
                    cw = canvas.width;

                img.scale(1);
                console.log(img.width);
                console.log(img.height);
                canvas.setWidth(img.width);
                canvas.setHeight(img.height);
                img.left = 0;
                img.top = 0;
                img.originX = "left";
                img.originY = "top";
                canvas.calcOffset();

                var imgSaved = canvas.toDataURL("image/png");
                console.log(imgSaved);


                var image = new Image(); 
                image.src = imgSaved;
                canvas.item(0).remove();

                $("#canvas").find(".upper-canvas ").remove();

                canvas.setWidth(cw);
                canvas.setHeight(ch);
                console.log("cw:",cw,"ch:",ch);
                canvas = create(image,100,100);

                window.open(imgSaved,"image");
            });

//////////////////////////////////////////////////////////////////// Image Crop

           $('#imageCrop').click(function(){
            if (croped == true){
                alert();
                return false;
            }
            if ($("#rotate").prop("checked")){
                alert("can't crop rotated image :'(");
                return false;
            }

               var crop = new fabric.Rect({
                    left: x/2-100,
                    top: y/2-100,
                    width:100,
                    height:100,
                    fill: "red",
                    opacity: .3,
               });
               canvas.add(crop);
               canvas.setActiveObject(canvas.item(1));
               croped = true;

               $("#crop").click(function(){
                    var selection = canvas.item(1),
                        sx = selection.left,
                        sy = selection.top,
                        ssx = selection.scaleX,
                        ssy = selection.scaleY;

                    var oImage = canvas.item(0);
                    var ix = oImage.left,
                        iy = oImage.top,
                        isx = oImage.scaleX,// equal to isy
                        isy = oImage.scaleY;// equal to isx

                    console.log("ix:",ix,"iy:",iy);


                    ix = ix - (oImage.width*isx)/2;
                    iy = iy - (oImage.height*isy)/2;
                    
                    console.log("ix:",ix,"iy:",iy);

                    realX = (sx - ix)*(1/isx);
                    realY = (sy - iy)*(1/isy);
                    realW = (100*ssx)*(1/isx);
                    realH = (100*ssy)*(1/isy);
                    console.log("realX:",realX,"realY:",realY,"is:",isx,"realW:",realW,"realH:",realH);

                    canvas.renderAll();



                    canvas.remove(canvas.item(1));
                
/////////////////////////////////////////////////////////////////


                var Scale = imageScale;
                canvas.setActiveObject(canvas.item(0));
                img = canvas.getActiveObject();

                var ch = canvas.height,
                    cw = canvas.width;

                img.scale(1);
                console.log(img.width);
                console.log(img.height);
                canvas.setWidth(img.width);
                canvas.setHeight(img.height);
                img.left = 0;
                img.top = 0;
                img.originX = "left";
                img.originY = "top";
                canvas.calcOffset();
                canvas.width = img.width;
                canvas.height = img.height;
                var dataURL = canvas.toDataURL({
                        left: realX,
                        top: realY,
                        width: realW,
                        height: realH
                    });
                console.log("saved",dataURL);

                var image = new Image(); 
                image.src = dataURL;
                canvas.item(0).remove();

                $("#canvas").find(".upper-canvas ").remove();

                canvas.setWidth(cw);
                canvas.setHeight(ch);
                console.log("cw:",cw,"ch:",ch);
                canvas = create(image,100,100);
                croped = false;

            });

               $("#cancel").click(function(){
                    canvas.item(1).remove();   
                    croped = false;

                    return;
               });
      
            }); // image crop
  


            // mouse wheel handle
            function initMouseWheel(canvas) {
                $(canvas.wrapperEl).on("mousewheel", function(e){
                var target = canvas.findTarget(e);
                var delta = e.originalEvent.wheelDelta / 3000;
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
                    canvas.renderAll();
                    return false;
                }
                });
            }

            function scaleImage(x,y,ix,iy) {
                scaleCoeffX = x/ix;
                scaleCoeffY = y/iy;
                if (scaleCoeffX>scaleCoeffY){
                    scaleCoeff = scaleCoeffY;
                } else {
                    scaleCoeff = scaleCoeffX;
                }
                return scaleCoeff;
            }

            var f = fabric.Image.filters;

            // Filters
            var appliedFilters = [];

            function applyFilter(idx, filter) {
                canvas.setActiveObject(canvas.item(0));
                var img = canvas.getActiveObject();
                img.filters[idx] = filter;
                img.applyFilters(canvas.renderAll.bind(canvas));
                appliedFilters[idx] = filter;
            }


            function applyFilterValue(index, prop, value) {
                canvas.setActiveObject(canvas.item(0));
                var obj = canvas.getActiveObject();
                if (obj.filters[index]) {
                    obj.filters[index][prop] = value;
                    obj.applyFilters(canvas.renderAll.bind(canvas));
                }
            }



            $("#grayscale").click(function() {
                applyFilter(0, this.checked && new f.Grayscale());
            });

            $("#invert").click(function() {
                applyFilter(1, this.checked && new f.Invert());
            });

            $("#sepia").click(function() {
                applyFilter(15, this.checked && new f.SepiaTone());
            });

            $("#brightness").click(function () {
                applyFilter(13, this.checked && new f.BrightnessContrast({
                    "brightness": parseInt($("#brightness-value").val(), 10),
                    "contrast": parseInt($("#contrast-value").val(), 10) / 100
                }));
            });

            $("#brightness-value").change(function() {
                applyFilterValue(13, "brightness", parseInt(this.value, 10));
            });

            $("#contrast-value").change(function() {
                applyFilterValue(13, "contrast", parseInt(this.value, 10) / 100);
            });

            $("#hsl").click(function () {
                applyFilter(14, this.checked && new f.HSL({
                    "hue": parseInt($("#hue-value").val(), 10),
                    "saturation": parseInt($("#saturation-value").val(), 10),
                    "lightness": parseInt($("#lightness-value").val(), 10)
                }));
            });

            $("#hue-value").change(function() {
                applyFilterValue(14, "hue", parseInt(this.value, 10));
            });

            $("#saturation-value").change(function() {
                applyFilterValue(14, "saturation", parseInt(this.value, 10));
            });

            $("#lightness-value").change(function() {
                applyFilterValue(14, "lightness", parseInt(this.value, 10));
            });


            $("#rotate").click(function() {
                if (croped==true){
                    return false;
                }
                canvas.setActiveObject(canvas.item(0));
                var img = canvas.getActiveObject(),
                    angle = 0;
                if (this.checked) {
                    angle = parseInt($("#rotate-value").val(), 10)
                }
                img.setAngle(angle).setCoords();
                canvas.renderAll();
            });

            $("#rotate-value").change(function() {
                if ($("#rotate").is(":checked")) {
                    var img = canvas.getActiveObject();
                    img.setAngle(parseInt(this.value, 10)).setCoords();
                    canvas.renderAll();
                }
            });

            

            $("#flipx").click(function() {
                var img = canvas.getActiveObject();
                if (this.checked) {
                    img.flipX = true;
                } else {
                    img.flipX = false;
                }
                canvas.renderAll();
            });

            $("#flipy").click(function() {
                var img = canvas.getActiveObject();
                if (this.checked) {
                    img.flipY = true;
                } else {
                    img.flipY = false;
                }
                canvas.renderAll();
            });

            $("#blur").click(function() {
                applyFilter(9, this.checked && new f.Convolute({
                matrix: [1/9, 1/9, 1/9,
                         1/9, 1/9, 1/9,
                         1/9, 1/9, 1/9]
                }));
            });

            $("#sharpen").click(function() {
                applyFilter(10, this.checked && new f.Convolute({
                matrix: [0, -1, 0,
                        -1,  5, -1,
                         0, -1,  0]
                }));
            });

            $("#emboss").click(function() {
                applyFilter(11, this.checked && new f.Convolute({
                matrix: [1, 1, 1,
                         1, .7, -1,
                        -1, -1, -1 ]
                }));
            });
        }
    }
});



