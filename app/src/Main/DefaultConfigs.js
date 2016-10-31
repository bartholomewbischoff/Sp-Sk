angular
    .module('main')
    
    .factory('DefaultConfigs', function() {
        currentDate = new Date(Date.now());
        currentTime = (currentDate.getHours()<10?'0':'') + currentDate.getHours() + ':' + (currentDate.getMinutes()<10?'0':'') + currentDate.getMinutes();

        apps = [{ 'id': '1',
                  'name': 'Spectre',
                  'isDisabled': true
                }, {
                  'id': '2',
                  'name': 'Skyfall',
                  'isDisabled': false
                }];

        return {
            'selectedApp': apps[1],
            'classificationText': 'UNCLASSIFIED',
            'classificationClass': 'classif-unclass',
            'defaultSatelliteOption': '3',
            'liveFeedSelected': true,
            'defaultDate': currentDate,
            'defaultTime': currentTime,
            'defaultDelta': '',
            'defaultAOI': '',

            'tiles': {
                '1': {
                    'prefix': 'http://api.tiles.mapbox.com/v4/',
                    'suffix': '/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYm93bWFubWMiLCJhIjoieE9WenlhayJ9.QFS8jQtCusMhwwVSMQIg9w'
                },
                '2': {
                    'prefix': 'http://api.tiles.mapbox.com/v4/',
                    'suffix': '/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYm93bWFubWMiLCJhIjoieE9WenlhayJ9.QFS8jQtCusMhwwVSMQIg9w'
                },
                'heo1': {
                    'prefix': 'http://api.tiles.mapbox.com/v4/',
                    'suffix': '/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYm93bWFubWMiLCJhIjoieE9WenlhayJ9.QFS8jQtCusMhwwVSMQIg9w'
                }
            },

            'getProjection': function() {
                return new ol.proj.Projection({
                    //code: 'EPSG:3857',
                    code: 'EPSG:0000',
                    units: 'pixels',
                    extent: [0, 0, 8192, 8192]
                });
            },

            'getCoordinateTransforms': function(sensorId) {
                return null;
            },

            // how long to leave each "frame" on the screen in ms
            'updateInterval': 750,

            'optionDefaults': {
                'aoi': '3',
                'sensor': '1',
                'delta': '2',     // 2 hours back
                'end': null,
                'livefeed': true,
                'x': 4096,
                'y': 4096,
                'zoom': 2,
                'idx': 0
            },

            'availableSensors': [{
                'id': '1',
                'name': 'GEO1',
                'isDisabled': false
            }, {
                'id': '2',
                'name': 'GEO2',
                'isDisabled': false
            },{
                'id': '3',
                'name': 'HEO33',
                'isDisabled': false
            },{
                'id': '4',
                'name': 'HEO34',
                'isDisabled': false
            }],

            'availableAois': [{
                'id': '3',
                'name': '3 - Ohio',
                'isDisabled': false
            }, {
                'id': '4',
                'name': '4 - Florida',
                'isDisabled': false
            }, {
                'id': '5',
                'name': '5 - North Carolina',
                'isDisabled': false
            }],

            'validDeltas': [{
                'id': '2',
                'name': '2 Hours',
                'isDisabled': false
            }, {
                'id': '4',
                'name': '4 Hours',
                'isDisabled': false
            }, {
                'id': '6',
                'name': '6 Hours',
                'isDisabled': false
            }, {
                'id': '12',
                'name': '12 Hours',
                'isDisabled': false
            }, {
                'id': '24',
                'name': '24 Hours',
                'isDisabled': false
            }, {
                'id': '48',
                'name': '48 Hours',
                'isDisabled': false
            }, {
                'id': '72',
                'name': '72 Hours',
                'isDisabled': false
            }, {
                'id': '576',
                'name': '24 Days',
                'isDisabled': false
            }]
        };

    });
