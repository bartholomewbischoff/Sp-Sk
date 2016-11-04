angular
  .module('main', ['ngMaterial'])
  .controller('MainController', function($interval, $location, $scope, $mdDialog, $mdSidenav, $mdToast, DefaultConfigs, MapService) {
    
    var originatorEv;
    // variable for animation interval
    var animationRunner;
    // boolean for satellite footprint widget view status
    var satViewOpen;
    // boolean for status of layers
    $scope.noLayers = true;
    // booleans for view status of sidenavs
    //$scope.obj = false;
    $scope.obj = { "filternav": false, "algonav": false, "settingsnav": false, "helpnav": false, "phenomnav": false, "infonav": false };
    // stores the array of images that are to excluded from the movie maker
    $scope.removedImages = [];
    // stores the filter form values 
    $scope.filterVals = {
        'start': null,
        'end': null
    };
    /*$scope.filterVals = {
        'endDate': '',
        'endTime': '',
        'selectedSensor': '',
        'selectedDelta': '',
        'isLive': false
    };*/
    // stores the id of the currently viewed layer, initial value on page load is the url start param
    $scope.currentId = 0;
    // stores the id of the previously viewed layer
    $scope.prevId = null;
    // stores the user settings defined in the DefaultConfigs.js
    $scope.data = DefaultConfigs;
    // stores the status of the play control
    $scope.playStatus = false;
    // stores the introjs help settings to be used by the view
    $scope.helpSettings;

    // Delays initialization of the openlayers map until page is ready.
    window.onload = function() {
        // store url params
        $scope.filterVals.start  = parseInt($location.search().start, 10);
        $scope.filterVals.end = parseInt($location.search().end, 10);

        // set timeout so DOM is ready before map initialization is attempted
        setTimeout(
            function() {
                // if url params exist then build the map and controls
                if ($scope.filterVals.start && $scope.filterVals.end) {
                    initializeMap();
                }
                // after building map check if layers exist beyond the vector layer and set no layer boolean accordingly
                if (MapService.layers.length > 1) {
                    noLayers = false;
                } else {
                    noLayers = true;
                }
                // per design toggle filternav so user can set
                toggling('filternav');
            }, 5);

        // initialize the timeline container settings    
        $('#horizontal-container').slimscroll({
            alwaysVisible: true,
            height: '45px',
            width: '95%',
            axis: 'x'
        });
        
    };
 
    // Sidenav toggle function available to the main controller.
    var toggling = function(navId) {
      $.each($scope.obj, function(key, value) { 
          if ( value == true && navId != key ) {
              $mdSidenav(key).toggle();
              $scope.obj[key] = false 
          }
        });
      $mdSidenav(navId).toggle();
      $scope.obj[navId] = !$scope.obj[navId];
    };

    // Function used to check if id is on the movie list.
    // Used for display of X icon on timeline layer buttons. 
    $scope.movieCheck = function(ind) {
        // if ind is in array return boolean
        if( ($.inArray((ind), $scope.removedImages)) != -1 || ($.inArray((ind), $scope.removedImages)) > -1 ) {
            return true;
        } else {
            return false;
        }
    }

    // Function used to alter excluded id array on right click of timeline layer button.
    // Used by the ng-right-click directive on the timeline layer buttons.
    $scope.rightClick = function(ind) {
        // if ind is in array, remove ind from list, else add ind to list
        if( ($.inArray((ind), $scope.removedImages)) != -1 || ($.inArray((ind), $scope.removedImages)) > -1 ) {
            $scope.removedImages.splice( $.inArray(ind, $scope.removedImages) , 1 );
        } else {
            $scope.removedImages.push(ind);
        };
    };

    // Function to change style on timeline layer buttons based on whether layer is 
    // on the excluded from movie list or being currently viewed.  
    // Used by the ng-class directive on the timeline layer buttons.
    $scope.selectedGetClass = function(ind, playerId){

        // if ind is in array
        if( ($.inArray((playerId), $scope.removedImages)) != -1 || ($.inArray((playerId), $scope.removedImages)) > -1 ) {
            if( ind == ($scope.currentId) ) {
                return "selected"
            } 
            return "removed"
        } else if( ind == ($scope.currentId) ) {
            return "selected"
        } else {
            return ""
        }

    }

    // Function to check if a layer with a particular id exists
    var layerExists = function(id) {

        if (id !== null) {
            var result = [];
            MapService.layers.forEach( function(o) {
                if (o.id == (id)) {
                    result.push(o);
                }
            });
            if (result.length > 0) {
                return true;
            }
        }
        return false;
        
    }

    // Function to make array of layers available to the view.
    // Used by the ng-repeat directive on the timeline button element to create a button for each image layer.
    $scope.getImages = function() {
        return MapService.currentLayers
    }

    // Function to display image based on left click of layer button in timeline.
    // Used by the ng-click directive on the timeline layer buttons.
    this.gotoImage = function(id) {

        // store the current id as the previous id
        $scope.prevId = $scope.currentId;
        // set current id to new id value
        $scope.currentId = id;
        // update the map with the current rotation, zoom, and center settings
        MapService.updateCurrentRotation();
        MapService.updateCurrentZoom();
        MapService.updateCurrentCenter();
        // toggle the visibility of the layers
        $scope.setVisibility();

    }

    // Function to save the application settings changed in the settings sidenav.
    // Used by the ng-click directive on the apply button on the settings sidenav.
    this.saveSettings = function() {

        // if form is valid save settings
        if ($scope.settingsForm.$valid) {
            // updates play speed
            $scope.data.updateInterval = $scope.settingsForm.speed.$modelValue * DefaultConfigs.updateInterval;
        }
        // toggles settingsnav after apply button has been clicked
        this.toggle('settingsnav');

    }

    // Function to save the filter settings changed in the filter sidenav.
    // Used by the ng-click directive on the apply button on the filter sidenav.
    this.saveFilter = function() {

        
        var settings = {};
        // will stop animation if one is playing
        this.stopOption();
        // store form values
        settings.start = $scope.filterVals.start;
        settings.end = $scope.filterVals.end;
        // if values exist store to url params and turn off noLayers boolean
        if (settings.start && settings.end) {
            noLayers = false;
            $location.search('start', settings.start);
            $location.search('end', settings.end);
        }
        // reset the map, this clears the map from the DOM and deletes previous layers
        MapService.resetMap();
        // sets currentId and prevId values
        $scope.currentId = 0;
        $scope.prevId = null;
        // rebuild map
        initializeMap();
        // toggles filternav after apply button has been clicked
        this.toggle('filternav');

    }
    
    // Function that creates a toast to hold the satellite footprint data.
    // Used by the ng-click directive on the satellite view button, class "satFootButton".
    $scope.showSatelliteToast = function() {
        $mdToast.show({
          hideDelay   : 40000,
          parent      : '.map',
          position    : 'bottom right',
          controller  : 'MainController',
          templateUrl : 'satelliteToast.html'
        });
        satViewOpen = true;
    };

    // Function that controls the opening and closing of the satellite toast.
    // Used by the ng-click directive on the close satellite view button created 
    // in satelliteToast.html, class "satFootCloseButton".
    $scope.closeSatelliteToast = function() {
        if (satViewOpen) {
            return;
        }

        $mdToast
          .hide()
          .then(function() {
            satViewOpen = false;
          });
    };

    // Function that builds the openlayers map and initiates the necessary listeners
    // for the various controls.
    var initializeMap = function(target = 'map') {
        MapService.createMap(target);
        $scope.setVisibility();

        // listener for capturing mouse point
        MapService.map.on('click', function(event) {
            //var coord = ol.proj.transform(event.coordinate, 'EPSG:0000', 'EPSG:4326');
            var lon = event.coordinate[0];
            var lat = event.coordinate[1];
            console.log('The latitude is: ' + lon + ' and the longitude is ' + lat);
            //alert('The latitude is: ' + lon + ' and the longitude is ' + lat);
        });

        // listener for right click menu on map
        MapService.contextmenu.on('open', function(evt){
            var feature = MapService.map.forEachFeatureAtPixel(evt.pixel, function(ft, l){
                return ft;
            });

            if (feature && feature.get('type') == 'removable') {
                MapService.contextmenu.clear();
                MapService.removeMarkerItem.data = {
                    marker: feature
                };
                MapService.contextmenu.push(MapService.removeMarkerItem);
                
            } else {
                MapService.contextmenu.clear();
                MapService.contextmenu.extend(MapService.contextmenu_items);
            }
        });

        // enables interaction with the extent control by holding alt key
        document.addEventListener('keydown', function(event) {
            if (event.keyCode == 18) {
                MapService.extentBox.setActive(true);
            }
        });
        document.addEventListener('keyup', function(event) {
            if (event.keyCode == 18) {
                MapService.extentBox.setActive(false);
                var extent = MapService.extentBox.getExtent();
                console.log(extent);
            }
        });

        console.log("The map was initialized ...");
    };

    // Function that updates the openlayers map with current rotation, zoom, and center settings.
    // Used mostly by the player controls.
    var updateMap = function() {
        MapService.updateCurrentRotation();
        MapService.updateCurrentZoom();
        MapService.updateCurrentCenter();
        $scope.setVisibility();
    }

    // Function that sets the visibility of a map layer.
    $scope.setVisibility = function(ind=$scope.currentId, prev=$scope.prevId) {

        // get layers
        var temp = MapService.layers;
        // turn off previously viewed layer
        if (layerExists(prev)) {
            temp[prev].setVisible(false);
        }
        // turn on new layer
        if (layerExists(ind)) {
            temp[ind].setVisible(true);
        }
        
    };

    // Function to move forward by an interval of one through the map layers.
    // Used by the mapAnimation function and the ng-click directive on the forward button
    // on the map player controls.
    this.forwardOption = function() {
    
      // will iterate forward by one unless it is the last layer in the array
      // if in play mode, will start over once end of layer array is reached
      if ( $scope.currentId < (MapService.layers.length - 2) ) {
          // stores currentId as previousId
          $scope.prevId = $scope.currentId;
          // iterates forward
          $scope.currentId = parseInt($scope.currentId, 10) + 1;
      } else if($scope.playStatus) {
          // stores currentId as previousId
          $scope.prevId = $scope.currentId;
          // iterates back to beginning
          $scope.currentId = 0;
      } else {
          return
      }
      // updates map rotation, center, visibility, and zoom settings 
      updateMap();

    };

    // Function to move backward by an interval of one through the map layers.
    // Used by the ng-click directive on the backward button on the map player controls.
    this.backwardOption = function() {

      // will iterate backward by one unless it is the first layer in the array
      if ( $scope.currentId >= 1 ) {
          // stores currentId as previousId
          $scope.prevId = $scope.currentId;
          // iterates backward
          $scope.currentId = parseInt($scope.currentId, 10) - 1;
      } else {
          return
      }
      // updates map rotation, center, visibility, and zoom settings 
      updateMap();

    };

    // Function that will move the viewed layer to the last layer in the array.
    // Used by the ng-click directive on the end button on the map player controls.
    this.endOption = function() {

      // if not already the last layer
      if ( $scope.currentId < (MapService.layers.length - 2) ) {
        // stores currentId as previousId
        $scope.prevId = $scope.currentId;
        // move to the end of the array
        $scope.currentId = (MapService.layers.length - 2) ;
        // updates map rotation, center, visibility, and zoom settings 
        updateMap();
      }

    };

    // Function that will move the viewed layer to the first layer in the array.
    // Used by the ng-click directive on the start button on the map player controls.
    this.startOption = function() {

      // if not already the first layer
      if ( $scope.currentId >= 1 ) {
        // stores currentId as previousId
        $scope.prevId = $scope.currentId;
        // move to the beginning of the array
        $scope.currentId = 0;
        // updates map rotation, center, visibility, and zoom settings 
        updateMap();
      }

    };

    // Function that animates through the layers on the map.
    // Used by the ng-click directive on the play button on the map player controls.
    this.playOption = function() {

      // set to true so that the play control will be hid, stop control
      // will display, and the rest of the app options will be disabled
      $scope.playStatus = true;
      this.mapAnimation();
    };

    // Function used to play through the map layers.
    // Used by the playOption function.
    this.mapAnimation = function() {
        var this_ = this;
        // calls the forwardOption function at defined intervals defined by the users settings
        animationRunner = $interval(function() {
            this_.forwardOption();
        }, $scope.data.updateInterval);
    };

    // Function that will stop the animation of the map layers.
    // Used by the ng-click directive on the stop button on the map player controls.
    this.stopOption = function() {

      // set to false so stop control will be hid, play control will display, 
      // and the rest of the app options will be enabled
      $scope.playStatus = false;
      // ends animationRunner started in mapAnimation function
      if (angular.isDefined(animationRunner)) {
            $interval.cancel(animationRunner);
            animationRunner = undefined;
      }

    }

    // Function used to toggle sidenavs.
    this.toggle = function(navId) {
      $.each($scope.obj, function(key, value) { 
          if ( value == true && navId != key ) {
              $mdSidenav(key).toggle();
              $scope.obj[key] = false 
          }
        });
      $mdSidenav(navId).toggle();
      $scope.obj[navId] = !$scope.obj[navId];
    };

    // Function used to call the introjs help tutorial for the main app.
    // Used by the ng-click directive on the tutorial button on the help sidenav.
    this.mainHelp = function() {

      this.toggle('helpnav');
      $scope.helpSettings = this.mainHelpSettings;
      setTimeout(
          function() {
            $scope.CallMe();
        }, 20);

    };

    // Function used to call the introjs help tutorial for the algorith sidenav.
    // Used by the ng-click directive on the help button on the algorithm sidenav toolbar.
    this.algoHelp = function() {

      $scope.helpSettings = this.algoHelpSettings;
      setTimeout(
          function() {
            $scope.CallMe();
        }, 20);

    };

    // Function used to call the introjs help tutorial for the filter sidenav.
    // Used by the ng-click directive on the help button on the filter sidenav toolbar.
    this.filterHelp = function() {

      $scope.helpSettings = this.filterHelpSettings;
      setTimeout(
          function() {
            $scope.CallMe();
        }, 20);

    };

    // Function used to toggle the help sidenav and open the phenomenology sidenav
    // Used by the ng-click directive on the phenomenology button on the help sidenav.
    this.phenomHelp = function() {
      this.toggle('helpnav');
      this.toggle('phenomnav');
    };

    // Function used to toggle the help sidenav and open the info sidenav
    // Used by the ng-click directive on the info button on the help sidenav.
    this.infoPanel = function() {
      this.toggle('helpnav');
      this.toggle('infonav');
    }

    // Options for the main app introjs help tutorial.
    // Used by mainHelp function.
    this.mainHelpSettings = {
        steps:[
        {
            element: '.filterMenuButton',
            intro: 'Click here to change the filter options.',
            position:'right'
        },
        {
            element: '.algoMenuButton',
            intro: 'Click here to access the available algorithms.',
            position: 'right'
        },
        {
            element: '.satFootButton',
            intro: 'Click here to view the footprint of the current sensor.',
            position: 'right'
        },
        {
            element: '.settingsMenuButton',
            intro: 'Click here to change the applications defualt settings.',
            position: 'left'
        },
        {
            element: '.movieMenuButton',
            intro: 'Click here to create a movie from the currently loaded image layers.',
            position: 'right'
        },
        {
            element: '.photoMenuButton',
            intro: 'Click here to take a snapshot of the currently displayed layer.',
            position: 'right'
        },
        {
            element: '.playControls',
            intro: 'Control the map imagery by using these controls.',
            position: 'top'
        },
        {
            element: '#horizontal-container',
            intro: 'The tiles returned after setting the filter options are displayed here.  Click one to directly display that tile in the map region.  A red tile indicates that tile is missing and cannot be displayed.  A yellow tile indicates that tile is currently being viewed.',
            position: 'top'
        },
        {
            element: '.TrickingIntroJSwithThisClassName',
            intro: 'Imagery data will be displayed here. Rotate the image by using the ALT + SHIFT keys and the mouse to then grab the image and rotate.',
            position: 'top'
        },
        {
            element: '.ol-zoom',
            intro: 'Change zoom levels using these buttons or by using your mouse scroll wheel.',
            position: 'right'
        },
        {
            element: '.rotate-90',
            intro: 'Use the rotation controls to quickly rotate the image to a preset orientation.',
            position: 'right'
        },
        {
            element: '.ol-rotate-reset',
            intro: 'If the image is oriented from 0°, a button will display here which allows the user to quickly reorient the image to the 0° view.',
            position: 'right'
        }],
        showStepNumbers: false, 
        showBullets: true,
        exitOnOverlayClick: true, 
        exitOnEsc: true, 
        nextLabel: 'Next',
        prevLabel: 'Prev',
        skipLabel: 'Exit', 
        doneLabel: 'Done',
        keyboardNavigation: true  
    };

    // Options for the algorithm menu introjs help tutorial.
    // Used by algoHelp function.
    this.algoHelpSettings = {
        steps:[
        {
              element: '.hemiMenuButton',
              intro: 'Algorithm 1',
              position: 'right'
          },
          {
              element: '.monsoonMenuButton',
              intro: 'Algorithm 2',
              position: 'right'
          },
          {
              element: '.arapahoMenuButton',
              intro: 'Algorithm 3',
              position: 'right'
          },
          {
              element: '.stereoMenuButton',
              intro: 'Algorithm 4',
              position: 'right'
          },
          {
              element: '.giftMenuButton',
              intro: 'Algorithm 5',
              position: 'right'
          },
          {
              element: '.gossMenuButton',
              intro: 'Algorithm 6',
              position: 'right'
          }],
          showStepNumbers: false, 
          showBullets: true,
          exitOnOverlayClick: true, 
          exitOnEsc: true, 
          nextLabel: 'Next',
          prevLabel: 'Prev',
          skipLabel: 'Exit', 
          doneLabel: 'Exit' 
    };

    // Options for the filter menu introjs help tutorial.
    // Used by filterHelp function.
    this.filterHelpSettings = {
      steps:[
        {
            element: '.sensorControls',
            intro: 'Select the desired satellite.',
            position: 'right'
        },
        {
            element: '.timeControls',
            intro: 'If a live feed is selected check the "live feed" box", otherwise select a date and time.',
            position: 'right'
        },
        {
            element: '.timeBackControls',
            intro: 'Select the number of hours back from the selected date/time desired.',
            position: 'right'
        },
        {
            element: '.submitControl',
            intro: 'Click the "Apply" button when settings are as desired.',
            position: 'right'
        }],
        showStepNumbers: false, 
        showBullets: true,
        exitOnOverlayClick: true, 
        exitOnEsc: true, 
        nextLabel: 'Next',
        prevLabel: 'Prev',
        skipLabel: 'Exit', 
        doneLabel: 'Done',
        keyboardNavigation: true 
    };

    // Function used to display the HEMI algorithm options dialog.
    // Used by the ng-click directive on the hemi button on the algorithm sidenav
    this.hemiMenu = function() {

      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Algorithm 1')
          .textContent('Options will go here ...')
          .ok('Execute')
      );
      this.toggle('algonav');
      originatorEv = null;

    };

    // Function used to display the Monsoon algorithm options dialog.
    // Used by the ng-click directive on the monsoon button on the algorithm sidenav
    this.monsoonMenu = function() {

      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Algorithm 2')
          .textContent('Options will go here ...')
          .ok('Execute')
      );
      this.toggle('algonav');
      originatorEv = null;

    };

    // Function used to display the arapaho algorithm options dialog.
    // Used by the ng-click directive on the arapaho button on the algorithm sidenav
    this.arapahoMenu = function() {

      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Algorithm 3')
          .textContent('Options will go here ...')
          .ok('Execute')
      );
      this.toggle('algonav');
      originatorEv = null;

    };

    // Function used to display the Stereo algorithm options dialog.
    // Used by the ng-click directive on the stereo button on the algorithm sidenav
    this.stereoMenu = function() {

      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Algorithm 4')
          .textContent('Options will go here ...')
          .ok('Execute')
      );
      this.toggle('algonav');
      originatorEv = null;

    };

    // Function used to display the GIFT algorithm options dialog.
    // Used by the ng-click directive on the gift button on the algorithm sidenav
    this.giftMenu = function() {

      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Algorithm 5')
          .textContent('Options will go here ...')
          .ok('Execute')
      );
      this.toggle('algonav');
      originatorEv = null;

    };

    // Function used to display the GOSS algorithm options dialog.
    // Used by the ng-click directive on the goss button on the algorithm sidenav
    this.gossMenu = function() {

      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Algorithm 6')
          .textContent('Options will go here ...')
          .ok('Execute')
      );
      this.toggle('algonav');
      originatorEv = null;

    };

  })
  // Directive for the right click feature on the timeline layer buttons.
  .directive('ngRightClick', function($parse) {
    
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
  });