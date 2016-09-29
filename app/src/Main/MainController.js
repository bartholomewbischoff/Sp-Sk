angular
  .module('main', ['ngMaterial'])
  .controller('MainController', function($scope, $mdDialog, $mdSidenav, DefaultConfigs, MapService) {
    var originatorEv
    var currentImages = [1, 2, 3, 4, 5];

    $scope.data = DefaultConfigs;
    $scope.ind = 0;
    $scope.playStatus = true;
    $scope.HelpOptions = $scope.MainIntroOptions;

    // initialize the openlayers map
    var initializeMap = function(target = 'map') {  
        MapService.createMap(target, $scope.ind);
        console.log("The map was initialized ...");
    };
    
    // delays initialization of the openlayers map until page is ready
    angular.element(document.querySelector('#map')).ready(function () {
      setTimeout(
        function() {
          console.log("The map area is ready !!")
          initializeMap();
        }, 5);
    });

    // function to move forward one image
    this.forwardOption = function() {
      console.log("The forward button was clicked ...");
      if ($scope.ind < (currentImages.length - 1)) {
          $scope.ind = $scope.ind + 1;
      }
      else {
          $scope.ind = 0;
      };
      MapService.updateCurrentRotation();
      MapService.updateCurrentZoom();
      MapService.updateCurrentCenter();
      MapService.resetMap();
      initializeMap();
    };

    // function to move backward one image
    this.backwardOption = function() {
      console.log("The backward button was clicked ...");
      if ($scope.ind > 0)  {
          $scope.ind = $scope.ind - 1;
      }
      else {
          $scope.ind = currentImages.length - 1;
      };
      MapService.updateCurrentRotation();
      MapService.updateCurrentZoom();
      MapService.updateCurrentCenter();
      MapService.resetMap();
      initializeMap();
    };

    // function to move to end image
    this.endOption = function() {
      console.log("The end button was clicked ...");
      $scope.ind = currentImages.length - 1;
      MapService.updateCurrentRotation();
      MapService.updateCurrentZoom();
      MapService.updateCurrentCenter();
      MapService.resetMap();
      initializeMap();
    };

    // function to move to start image
    this.startOption = function() {
      console.log("The start button was clicked ...");
      $scope.ind = 0;
      MapService.updateCurrentRotation();
      MapService.updateCurrentZoom();
      MapService.updateCurrentCenter();
      MapService.resetMap();
      initializeMap();
    };

    // function to play through images
    this.playOption = function() {
      console.log("The play button was clicked ...");
      $scope.playStatus = false;
    };

    // function to stop playing through images
    this.stopOption = function() {
      console.log("The stop button was clicked ...");
      $scope.playStatus = true;
    };

    // function to toggle sidenav for search results, algorithms, filter options, and help menus
    this.toggle = function(navID) {
      $mdSidenav(navID).toggle();
    };

    // function to define the help bubbles
    this.helpOverlayIntro = function() {
      this.toggle('helpnav');
      $scope.HelpOptions = $scope.MainIntroOptions;
      setTimeout(
          function() {
            $scope.CallMe();
        }, 20);
    };

    // function to open the algorithms menu
    this.algoHelpOverlayIntro = function() {
      $scope.HelpOptions = $scope.AlgoIntroOptions;
      setTimeout(
          function() {
            $scope.CallMe();
        }, 20);
    };

    // function to open the algorithms menu
    this.filterHelpOverlayIntro = function() {
      $scope.HelpOptions = $scope.FilterIntroOptions;
      setTimeout(
          function() {
            $scope.CallMe();
        }, 20);
    };

    // function to open the phenomenology menu
    this.phenomHelpOptions = function() {
      this.toggle('helpnav');
      this.toggle('phenomnav');
    };

    // function to open the info panel
    this.infoPanel = function() {
      this.toggle('helpnav');
      this.toggle('infonav');
    }

    // Options for the help overlay
    $scope.MainIntroOptions = {
        steps:[
        {
            element: '.step1',
            intro: 'Click here to access the available algorithms.',
            position: 'right'
        },
        {
            element: '.step2',
            intro: 'Click here to change the filter options.',
            position:'left'
        },
        {
            element: '.step3',
            intro: 'Imagery data will be displayed here. Rotate the image by using the ALT + SHIFT keys and the mouse to then grab the image and rotate.',
            position: 'top'
        },
        {
            element: '.playControls',
            intro: 'Control the map imagery by using these controls.',
            position: 'bottom'
        },
        {
            element: '.ol-zoom',
            intro: 'Change zoom levels using these buttons or by using your mouse scroll wheel.',
            position: 'right'
        },
        {
            element: '.ol-full-screen',
            intro: 'Switch to the full screen mode if more viewing space is desired.  Switch back to the normal view using the ESC key or by clicking the maps X button.' ,
            position: 'left'
        },
        {
            element: '.step7',
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
    $scope.AlgoIntroOptions = {
        steps:[
        {
              element: '.algostep1',
              intro: 'Algorithm 1',
              position: 'right'
          },
          {
              element: '.algostep2',
              intro: 'Algorithm 2',
              position: 'right'
          },
          {
              element: '.algostep3',
              intro: 'Algorithm 3',
              position: 'right'
          },
          {
              element: '.algostep4',
              intro: 'Algorithm 4',
              position: 'right'
          },
          {
              element: '.algostep5',
              intro: 'Algorithm 5',
              position: 'right'
          },
          {
              element: '.algostep6',
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
    $scope.FilterIntroOptions = {
      steps:[
        {
            element: '.filterstep1',
            intro: 'Select the desired satellite.',
            position: 'auto'
        },
        {
            element: '.filterstep2',
            intro: 'Select a pre-defined AOI.',
            position: 'auto'
        },
        {
            element: '.filterstep3',
            intro: 'If a live feed is selected check the "live feed" box", otherwise select a date and time.',
            position: 'auto'
        },
        {
            element: '.filterstep4',
            intro: 'Select the number of hours back from the selected date/time desired.',
            position: 'auto'
        },
        {
            element: '.filterstep5',
            intro: 'Click the "Apply" button when settings are as desired.',
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

    // function to display HEMI algorithm options menu
    this.hemiMenu = function() {
      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('HEMI Chip and Stitch')
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
          .title('Monsoon')
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
          .title('Arapaho')
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
          .title('Stereo Cloud Top Altitude')
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
          .title('GIFT')
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
          .title('GOSS/SuperGOSS')
          .textContent('Options will go here ...')
          .ok('Execute')
      );
      this.toggle('algonav');
      originatorEv = null;
    };

  });