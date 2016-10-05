angular
    .module('SpectreSkyfall', ['ngMaterial', 'angular-intro', 'main'])
    .config(function($mdThemingProvider, $mdIconProvider){

        $mdIconProvider
            .defaultIconSet("./assets/svg/avatars.svg" , 128)
            .icon("algo"       , "./assets/svg/algorithm_48px.svg" , 48)
            .icon("close"      , "./assets/svg/close_48px.svg" , 48)
            .icon("earth"      , "./assets/svg/earth_48px.svg", 48)
            .icon("earth2"     , "./assets/svg/earth_2_48px.svg", 48)
            .icon("blueeye"    , "./assets/svg/blueeye_48px.svg", 48)
            .icon("photo"      , "./assets/svg/photo_48px.svg" , 48)
            .icon("filter"     , "./assets/svg/filter_48px.svg" , 48)
            .icon("firstpagearrow" , "./assets/svg/first_page_arrow_48px.svg" , 48)
            .icon("help"       , "./assets/svg/help_48px.svg" , 48)
            .icon("info"       , "./assets/svg/info_empty_48px.svg" , 48)
            .icon("lastpagearrow" , "./assets/svg/last_page_arrow_48px.svg" , 48)
            .icon("leftarrow"  , "./assets/svg/left_arrow_48px.svg" , 48)
            .icon("listmenu"   , "./assets/svg/list_48px.svg" , 48)
            .icon("livehelp"   , "./assets/svg/live_help_48px.svg" , 48)
            .icon("menu"       , "./assets/svg/menu.svg" , 24)
            .icon("movie"      , "./assets/svg/movies_48px.svg" , 48)
            .icon("playarrow"  , "./assets/svg/play_arrow_black_48px.svg" , 48)
            .icon("redeye"     , "./assets/svg/redeye_48px.svg", 48)
            .icon("rightarrow" , "./assets/svg/right_arrow_48px.svg" , 48)
            .icon("satellite"  , "./assets/svg/satellite_48px.svg" , 48)
            .icon("share"      , "./assets/svg/share.svg" , 24)
            .icon("stop"       , "./assets/svg/stop_48px.svg" , 48);
            

            $mdThemingProvider.theme('default')
                .primaryPalette('blue')
                .dark();

    });

$( document ).ready(function() {
    console.log('testing scrollbox')
    $('#demo').scrollbox({
        direction: 'h',
        distance: 140
    });
});