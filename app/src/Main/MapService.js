angular
    .module('main')
    .service('MapService', function(DefaultConfigs) {

        this.map = null;
        this.layers = [];
        // this.imageLayer = null;
        this.proj = null;
        this.baseURL = 'http://127.0.0.1:8888/';
        this.currentImages = [1, 2, 3, 4, 5];
        this.currentIter = 0;
        this.prevIter = null;
        this.zoomLevel = DefaultConfigs.optionDefaults.zoom;
        this.currentZoomLevel = this.zoomLevel;
        this.centerValue = [DefaultConfigs.optionDefaults.x, DefaultConfigs.optionDefaults.y];
        this.currentCenterValue = this.centerValue;
        this.currentRotationValue = 0;

        // creates a map projection
        this.createProjection = function() {
            this.proj = new ol.proj.Projection({
                code: 'EPSG:0000',
                units: 'pixels',
                extent: [0, 0, 8192, 8192]
            });
        }

        // creates a map layer
        this.createLayer = function(ind=this.currentIter, isVisible=false) {

            imageLayer = new ol.layer.Tile({
                preload: Infinity,
                source: new ol.source.XYZ({
                    //url: 'http://127.0.0.1:8888/{z}-{y}-{x}.png',
                    url: this.baseURL + this.currentImages[ind] + '/{z}-{y}-{x}.png',
                    projection: this.proj,
                    wrapX: false
                }),
                transitionEffect: 'resize',
                visible: isVisible
            });
            return imageLayer;
        }

        // updates the map layers
        this.buildLayers = function() {
            var temp = null;
            for (i = 0; i < this.currentImages.length; i++) {
                temp = this.createLayer(ind=i, isVisible=false);
                this.layers.push(temp);
            }
        }

        // set visibility of a layer
        this.setVisibility = function(ind=this.currentIter, prev=this.prevIter) {
            
            var temp = this.map.getLayers().getArray();
            console.log(prev);
            if (prev) {
                temp[prev].setVisible(false);
            }
            temp[ind].setVisible(true);
        }

        // 90° rotation controls
        this.RotateCW90 = function(opt_options) {
            var options = opt_options || {};
            var button = document.createElement('button');
            button.innerHTML = '90°';
            var this_ = this;

            var handleRotate90 = function() {
                this_.getMap().getView().setRotation(Math.PI/2);
            };

            button.addEventListener('click', handleRotate90, false);
            button.addEventListener('touchstart', handleRotate90, false);

            var element = document.createElement('div');
            element.className = 'step7 rotate-90 ol-unselectable ol-control';
            element.appendChild(button);

            ol.control.Control.call(this, {
                element: element,
                target: options.target
            });
        };

        ol.inherits(this.RotateCW90, ol.control.Control);

        // 180° rotation controls
        this.Rotate180 = function(opt_options) {
            var options = opt_options || {};
            var button = document.createElement('button');
            button.innerHTML = '180°';
            var this_ = this;

            var handleRotate180 = function() {
                this_.getMap().getView().setRotation(Math.PI);
            };

            button.addEventListener('click', handleRotate180, false);
            button.addEventListener('touchstart', handleRotate180, false);

            var element = document.createElement('div');
            element.className = 'step7 rotate-180 ol-unselectable ol-control';
            element.appendChild(button);

            ol.control.Control.call(this, {
                element: element,
                target: options.target
            });
        };

        ol.inherits(this.Rotate180, ol.control.Control);

        // 270° rotation controls
        this.Rotate270 = function(opt_options) {
            var options = opt_options || {};
            var button = document.createElement('button');
            button.innerHTML = '270°';
            var this_ = this;

            var handleRotate270 = function() {
                console.log(this_)
                this_.getMap().getView().setRotation(1.5 * Math.PI);
            };

            button.addEventListener('click', handleRotate270, false);
            button.addEventListener('touchstart', handleRotate270, false);

            var element = document.createElement('div');
            element.className = 'step7 rotate-270 ol-unselectable ol-control';
            element.appendChild(button);

            ol.control.Control.call(this, {
                element: element,
                target: options.target
            });
        };

        ol.inherits(this.Rotate270, ol.control.Control);

        // creates an openlayers map
        this.createMap = function(target) {
            this.createProjection();
            this.buildLayers();

            var logoElement = document.createElement('a');
            logoElement.href = 'http://www.osgeo.org/';
            logoElement.target = '_blank';

            var logoImage = document.createElement('img');
            logoImage.src = 'https://www.osgeo.org/sites/all/themes/osgeo/logo.png';

            logoElement.appendChild(logoImage);

            this.map = new ol.Map({
                layers: this.layers,
                target: target,
                renderer: 'canvas',
                controls: ol.control.defaults().extend([
                    new ol.control.FullScreen(),
                    new this.RotateCW90(),
                    new this.Rotate180(),
                    new this.Rotate270()
                ]),
                view: new ol.View({
                    center: this.currentCenterValue,
                    zoom: this.currentZoomLevel,
                    maxZoom: 5,
                    projection: DefaultConfigs.getProjection(),
                    rotation: this.currentRotationValue
                }),
                logo: logoElement
            });
        }

        // removes a map
        this.resetMap = function() {
            // Remove the old map if there is one
            if (typeof this.map !== 'undefined' && this.map !== null) {
                $('.ol-viewport').remove();
            }
            this.map = null;
        };

        // retain current zoom level
        this.updateCurrentZoom = function() {
            this.currentZoomLevel = this.map.getView().getZoom();
        }

        // retain current view center
        this.updateCurrentCenter = function() {
            this.currentCenterValue = this.map.getView().getCenter();
        }

        // retain current view rotation
        this.updateCurrentRotation = function() {
            this.currentRotationValue = this.map.getView().getRotation();
        }

        // update layers on map
        this.updateLayers = function(layers) {
            this.map.getLayers().insertAt(0, layers);
        }

});