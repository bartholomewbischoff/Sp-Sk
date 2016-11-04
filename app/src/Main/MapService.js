angular
    .module('main')
    .service('MapService', function($location, DefaultConfigs) {

        this.map = null;
        this.layers = [];
        this.proj = null;
        this.baseURL = 'http://127.0.0.1:8888/';
        this.currentLayers = [];
        this.zoomLevel = DefaultConfigs.optionDefaults.zoom;
        this.currentZoomLevel = this.zoomLevel;
        this.centerValue = [DefaultConfigs.optionDefaults.x, DefaultConfigs.optionDefaults.y];
        this.currentCenterValue = this.centerValue;
        this.currentRotationValue = 0;
        this.tileAttribution = new ol.Attribution({ html: '<img src="./assets/images/af.png"> <img src="./assets/images/nasic.png">'});

        function l(id, playerId) {
            this.id = id;
            this.playerId = playerId;
        }

        function copyToClipboard(data) {
            angular.element('<textarea/>')
                .css({ 'opacity' : '0', 'position' : 'fixed' })
                .text(data)
                .appendTo(angular.element(window.document.body))
                .select()
                .each(function() { document.execCommand('copy') })
                .remove();
        };

        // creates a map projection
        this.createProjection = function() {
            this.proj = new ol.proj.Projection({
                code: 'EPSG:0000',
                units: 'pixels',
                extent: [0, 0, 8192, 8192]
            });
        };

        // creates a map layer
        this.createLayer = function(ind, isVisible=false, counter=1) {
            imageLayer = new ol.layer.Tile({
                preload: Infinity,
                source: new ol.source.XYZ({
                    url: this.baseURL + ind + '/{z}-{y}-{x}.png',
                    projection: this.proj,
                    wrapX: false,
                    attributions: [this.tileAttribution]
                }),
                transitionEffect: 'resize',
                visible: isVisible
            });
            imageLayer.id = counter;
            imageLayer.playerId = parseInt(ind, 10);

            return imageLayer;
        };

        // updates the map layers
        this.buildLayers = function() {
            var urlSettings = $location.search();
            var temp = null;
            var counter = -1;
            this.currentLayers = [];
            
            for (i = parseInt(urlSettings.start, 10); i < (parseInt(urlSettings.end, 10)+1); i++) {
                console.log('i is: ' + i);
                counter = counter + 1;
                var temp = new l(counter, i);
                this.currentLayers.push(temp);
                temp = this.createLayer(ind=i, isVisible=false, counter=counter);
                this.layers.push(temp);
            }

            vectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });

            this.layers.push(vectorLayer);

        };

        // 90° rotation controls
        this.RotateCW90 = function(opt_options) {
            var options = opt_options || {};
            var button = document.createElement('button');
            button.innerHTML = '<img src="./assets/svg/rotate_90_18px.svg" alt="Rotate 90" >';
            var this_ = this;

            var handleRotate90 = function() {
                var temp = this_.getMap().getView().getRotation()
                this_.getMap().getView().setRotation(temp + Math.PI/2);
            };

            button.addEventListener('click', handleRotate90, false);
            button.addEventListener('touchstart', handleRotate90, false);

            var element = document.createElement('div');
            element.className = 'rotate-90 ol-unselectable ol-control';
            element.appendChild(button);

            ol.control.Control.call(this, {
                element: element,
                target: options.target
            });
        };

        ol.inherits(this.RotateCW90, ol.control.Control);

        // creates an openlayers map
        this.createMap = function(target) {
            this.createProjection();
            this.buildLayers();

            if (this.currentLayers.length != 0) {
                // create control for adding mouse coordinates to the map
                var mousePositionControl = new ol.control.MousePosition({
                    coordinateFormat: ol.coordinate.createStringXY(4),
                    projection: DefaultConfigs.getProjection(),
                    undefinedHTML: '&nbsp;'
                });

                // create interaction for adding dragBox to the map
                var dragBox = new ol.interaction.DragBox({
                    condition: ol.events.condition.platformModifierKeyOnly
                });
                // listener for dragBox to acquire the dimensions
                dragBox.on('boxend', function() {
                    var extent = dragBox.getGeometry().getExtent();
                    console.log(extent);
                });
                // listener incase action is needed at end of box creation
                dragBox.on('boxstart', function() {
                });

                // create interaction for adding extent to the map
                this.extentBox = new ol.interaction.Extent({
                    condition: ol.events.condition.altKeyOnly
                });
                this.extentBox.setActive(false);

                // create the map 
                this.map = new ol.Map({
                    layers: this.layers,
                    target: target,
                    renderer: 'canvas',
                    controls: ol.control.defaults().extend([
                        //new ol.control.FullScreen(),
                        //this.contextmenu,
                        new this.RotateCW90(),
                        mousePositionControl
                    ]),
                    interactions: ol.interaction.defaults().extend([
                        dragBox,
                        this.extentBox
                    ]),
                    view: new ol.View({
                        center: this.currentCenterValue,
                        zoom: this.currentZoomLevel,
                        maxZoom: 5,
                        projection: DefaultConfigs.getProjection(),
                        rotation: this.currentRotationValue
                    })
                });

                var url_clipboard = './assets/svg/clipboard_48px.svg';
                var url_marker = './assets/svg/location_on_48px.svg';
                var url_unmarker = './assets/svg/location_off_48px.svg';
                var url_center = './assets/svg/searching_48px.svg';

                // from https://github.com/DmitryBaranovskiy/raphael
                var elastic = function(t) {
                    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
                };

                var center = function(obj, foo = this.map){
                    var pan = ol.animation.pan({
                        duration: 1000,
                        easing: elastic,
                        source: foo.getView().getCenter()
                    });

                    foo.beforeRender(pan);
                    foo.getView().setCenter(obj.coordinate);
                };

                var copycoord = function(event) {
                    //var coord = ol.proj.transform(event.coordinate, 'EPSG:0000', 'EPSG:4326');
                    var lon = event.coordinate[0];
                    var lat = event.coordinate[1];
                    console.log('The latitude is: ' + lon + ' and the longitude is ' + lat);
                    copyToClipboard(lat + ', ' + lon);
                    //alert('The latitude is: ' + lon + ' and the longitude is ' + lat);
                };

                this.contextmenu_items = [
                    {
                        text: 'Center map here',
                        callback: center,
                        icon: url_center
                    },
                    //'-', this is a separator
                    {
                        text: 'Copy Coordinates',
                        callback: copycoord,
                        icon: url_clipboard
                    }
                ];

                this.contextmenu = new ContextMenu({
                    width: 190,
                    default_items: false,
                    items: this.contextmenu_items
                });

                this.map.addControl(this.contextmenu);
            }
        };

        // removes a map
        this.resetMap = function() {
            // Remove the old map if there is one
            if (typeof this.map !== 'undefined' && this.map !== null) {
                $('.ol-viewport').remove();
            }
            this.map = null;
            this.layers = [];
            console.log('The map was reset');
        };

        // retain current zoom level
        this.updateCurrentZoom = function() {
            this.currentZoomLevel = this.map.getView().getZoom();
        };

        // retain current view center
        this.updateCurrentCenter = function() {
            this.currentCenterValue = this.map.getView().getCenter();
        };

        // retain current view rotation
        this.updateCurrentRotation = function() {
            this.currentRotationValue = this.map.getView().getRotation();
        };

        // update layers on map
        this.updateLayers = function(layers) {
            this.map.getLayers().insertAt(0, layers);
        };

});