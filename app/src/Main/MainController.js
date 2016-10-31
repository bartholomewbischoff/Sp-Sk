angular
  .module('main', ['ngMaterial'])
  .controller('MainController', function($interval, $scope, $mdDialog, $mdSidenav, $mdToast, DefaultConfigs, MapService) {
    var originatorEv
    var currentImages = [1, 2, 3, 4, 5];
    $scope.testcurrentImages = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}, {id:6}, {id:7}, {id:8}, {id:9}, {id:10}, {id:11}, {id:12}, {id:13}, {id:14}, {id:15}, {id:16}, {id:17}, {id:18}, {id:19}, {id:20}, {id:21}, {id:22}];
    //$scope.testcurrentImages = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}];
    $scope.lenCurrentImages = $scope.testcurrentImages.length;
    var isDlgOpen;
    $scope.remainingImages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

    $scope.data = DefaultConfigs;
    $scope.playStatus = false;
    $scope.helpSettings;

    // delays initialization of the openlayers map until page is ready
    window.onload = function() {
        setTimeout(
            function() {
                initializeMap();
                toggling('filternav');
            }, 5);

        $('#horizontal-container').slimscroll({
            alwaysVisible: true,
            height: '45px',
            width: '95%',
            axis: 'x'
        });
    };
 
    // sidenav toggle function available to the controller
    var toggling = function(navID) {
      $mdSidenav(navID).toggle();
    };

    // function to check if value is on the movie list
    $scope.movieCheck = function(ind) {
        if( ($.inArray((ind), $scope.remainingImages)) != -1 || ($.inArray((ind), $scope.remainingImages)) > -1 ) {
            return false;
        } else {
            return true;
        }
    }

    // function to alter movie id array on right click
    $scope.rightClick = function(ind) {
        if( ($.inArray((ind), $scope.remainingImages)) != -1 || ($.inArray((ind), $scope.remainingImages)) > -1 ) {
            $scope.remainingImages.splice( $.inArray(ind, $scope.remainingImages) , 1 );
        } else {
            $scope.remainingImages.push(ind);
        };
    };

    // function to change style on timeline button on click  
    $scope.selectedGetClass = function(ind){

        if( ($.inArray((ind), $scope.remainingImages)) == -1 ){
            if( ind == (MapService.currentIter + 1) ) {
                return "selected"
            } 
            return "removed"
        } else if( ind == (MapService.currentIter + 1) ) {
            return "selected"
        } else {
            return ""
        }
    }

    // save the application settings
    this.saveSettings = function() {
        if ($scope.settingsForm.$valid) {
            $scope.data.updateInterval = $scope.settingsForm.speed.$modelValue * DefaultConfigs.updateInterval;
        }
        console.log('Settings were saved ...');
        this.toggle('settingsnav');
    }

    // save the filter settings
    this.saveFilter = function() {
        console.log('Filter settings were saved ...');
        this.toggle('filternav');
    }
    
    // creates a toast to hold the satellite location info
    $scope.showSatelliteToast = function() {
        $mdToast.show({
          hideDelay   : 40000,
          parent      : '.map',
          position    : 'bottom right',
          controller  : 'MainController',
          templateUrl : 'satelliteToast.html'
        });
        isDlgOpen = true;
    };

    // controls the opening and closing of the satellite toast
    $scope.closeSatelliteToast = function() {
        if (isDlgOpen) return;

        $mdToast
          .hide()
          .then(function() {
            isDlgOpen = false;
          });
    };

    // initialize the openlayers map
    var initializeMap = function(target = 'map') {  
        MapService.createMap(target);
        MapService.setVisibility();

        // listener for moving pointer
        /*MapService.map.addEventListener('pointermove', function(e) {
            if (e.dragging) return;
            
            var pixel = this.getEventPixel(e.originalEvent);
            var hit = this.hasFeatureAtPixel(pixel);
        
            map.style.cursor = hit ? 'pointer' : '';
        });*/

        // listener for capturing mouse point
        MapService.map.on('click', function(event) {
            //var coord = ol.proj.transform(event.coordinate, 'EPSG:0000', 'EPSG:4326');
            var lon = event.coordinate[0];
            var lat = event.coordinate[1];
            console.log('The latitude is: ' + lon + ' and the longitude is ' + lat);
            //alert('The latitude is: ' + lon + ' and the longitude is ' + lat);
        });

        // listener for right click menu
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

        //Enable interaction by holding alt key
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

    // update the openlayers map
    var updateMap = function() {
        MapService.updateCurrentRotation();
        MapService.updateCurrentZoom();
        MapService.updateCurrentCenter();
        MapService.setVisibility();
    }

    // function to display image based on selection in timeline
    this.gotoImage = function(id) {
        MapService.prevIter = MapService.currentIter;
        MapService.currentIter = id - 1;
        MapService.updateCurrentRotation();
        MapService.updateCurrentZoom();
        MapService.updateCurrentCenter();
        MapService.setVisibility(ind=(id-1));
    }

    this.mapAnimation = function() {
        var mapani = this;
        animationRunner = $interval(function() {
            mapani.forwardOption();
        }, $scope.data.updateInterval);
    };

    // function to move forward one image
    this.forwardOption = function() {
      console.log("The forward button was clicked ...");
      if (MapService.currentIter < (currentImages.length - 1)) {
          MapService.prevIter = MapService.currentIter;
          MapService.currentIter = MapService.currentIter + 1;
      }
      else {
          MapService.prevIter = MapService.currentIter;
          MapService.currentIter = 0;
      };
      updateMap();
    };

    // function to move backward one image
    this.backwardOption = function() {
      console.log("The backward button was clicked ...");
      if (MapService.currentIter > 0)  {
          MapService.prevIter = MapService.currentIter;
          MapService.currentIter = MapService.currentIter - 1;
      }
      else {
          MapService.prevIter = MapService.currentIter;
          MapService.currentIter = currentImages.length - 1;
      };
      updateMap();
    };

    // function to move to end image
    this.endOption = function() {
      console.log("The end button was clicked ...");
      MapService.prevIter = MapService.currentIter;
      MapService.currentIter = currentImages.length - 1;
      updateMap();
    };

    // function to move to start image
    this.startOption = function() {
      console.log("The start button was clicked ...");
      MapService.prevIter = MapService.currentIter;
      MapService.currentIter = 0;
      updateMap();
    };

    // function to play through images
    this.playOption = function() {
      $scope.playStatus = true;
      this.mapAnimation();
    };

    // function to stop playing through images
    this.stopOption = function() {
      console.log("The stop button was clicked ...");
      $scope.playStatus = false;
      if (angular.isDefined(animationRunner)) {
            $interval.cancel(animationRunner);
            animationRunner = undefined;
        }
    }

    // function to toggle sidenav for search results, algorithms, filter options, and help menus
    this.toggle = function(navID) {
      $mdSidenav(navID).toggle();
    };

    // function to define the main help bubbles
    this.mainHelp = function() {
      this.toggle('helpnav');
      $scope.helpSettings = this.mainHelpSettings;
      setTimeout(
          function() {
            $scope.CallMe();
        }, 20);
    };

    // function to open the algorithms menu
    this.algoHelp = function() {
      $scope.helpSettings = this.algoHelpSettings;
      setTimeout(
          function() {
            $scope.CallMe();
        }, 20);
    };

    // function to open the algorithms menu
    this.filterHelp = function() {
      $scope.helpSettings = this.filterHelpSettings;
      setTimeout(
          function() {
            $scope.CallMe();
        }, 20);
    };

    // function to open the phenomenology menu
    this.phenomHelp = function() {
      this.toggle('helpnav');
      this.toggle('phenomnav');
    };

    // function to open the info panel
    this.infoPanel = function() {
      this.toggle('helpnav');
      this.toggle('infonav');
    }

    // Options for the help overlay
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

    //Algorithms help options
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

    // Filter help options
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

    // function to display HEMI algorithm options menu
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

    // function to display Monsoon algorithm options menu
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

    // function to display Arapaho algorithm options menu
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

    // function to display Stereo Cloud algorithm options menu
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

    // function to display GIFT algorithm options menu
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

    // function to display GOSS/SuperGOSS algorithm options menu
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