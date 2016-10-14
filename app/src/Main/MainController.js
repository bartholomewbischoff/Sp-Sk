angular
  .module('main', ['ngMaterial'])
  .controller('MainController', function($interval, $scope, $mdDialog, $mdSidenav, $mdToast, DefaultConfigs, MapService) {
    var originatorEv
    var currentImages = [1, 2, 3, 4, 5];
    $scope.testcurrentImages = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}, {id:6}, {id:7}, {id:8}, {id:9}, {id:10}, {id:11}, {id:12}, {id:13}, {id:14}, {id:15}, {id:16}, {id:17}, {id:18}, {id:19}, {id:20}, {id:21}, {id:22}];
    //$scope.testcurrentImages = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}];
    $scope.lenCurrentImages = $scope.testcurrentImages.length;
    var isDlgOpen;

    $scope.data = DefaultConfigs;
    $scope.playStatus = false;
    $scope.helpSettings;

    // delays initialization of the openlayers map until page is ready
    angular.element(document.querySelector('#map')).ready(function () {
        setTimeout(
            function() {
                initializeMap();
            }, 5);

        $('#horizontal-container').slimscroll({
            alwaysVisible: true,
            height: '64px',
            width: '95%',
            axis: 'x'
        });
    });
    
    // creates a toast to hold the satellite location info
    $scope.showSatelliteToast = function() {
        $mdToast.show({
          hideDelay   : 40000,
          parent      : '.map',
          position    : 'bottom left',
          controller  : 'MainController',
          templateUrl : 'satelliteToast.html'
        });
        isDlgOpen = true;
    };

    // controls the opening and closing of the satellite toast
    $scope.closeSatelliteToast = function() {
        console.log('testing');
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
        console.log("The map was initialized ...");
    };

    // update the map
    var updateMap = function() {
        MapService.updateCurrentRotation();
        MapService.updateCurrentZoom();
        MapService.updateCurrentCenter();
        MapService.setVisibility();
    }

    // function to display selected image in timeline
    this.gotoImage = function(id) {
        console.log("I was clicked");
        console.log(id);
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
        }, DefaultConfigs.updateInterval);
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
            element: '.algoMenuButton',
            intro: 'Click here to access the available algorithms.',
            position: 'right'
        },
        {
            element: '.filterMenuButton',
            intro: 'Click here to change the filter options.',
            position:'right'
        },
        {
            element: '.settingsMenuButton',
            intro: 'Click here to change the applications defualt settings.',
            position: 'left'
        },
        {
            element: '.satFootButton',
            intro: 'Click here to view the footprint of the current sensor.',
            position: 'right'
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
            position: 'bottom'
        },
        {
            element: '#horizontal-container',
            intro: 'The tiles returned after setting the filter options are displayed here.  Click one to directly display that tile in the map region.  A red tile indicates that tile is missing and cannot be displayed.  A yellow tile indicates that tile is currently being viewed.',
            position: 'bottom'
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
        },
        {
            element: '.ol-full-screen',
            intro: 'Switch to the full screen mode if more viewing space is desired.  Switch back to the normal view using the ESC key or by clicking the maps X button.' ,
            position: 'left'
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

  });