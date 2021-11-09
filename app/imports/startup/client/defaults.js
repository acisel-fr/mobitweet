import moment from '/public/moment-with-locales.min.js';

// Mise à jour des données démographiques

__DEMOGRAPHY_NEXT_AVAILABILITY = () => moment().subtract(1, 'months');

// Présentation des résultats de recherche
__LIMIT_MESSAGE = 10;
__LIMIT = 10;
__LIMIT_INC = 5;

// Position GPS
__ZOOM_POINT = 17;
__ZOOM_AREA = 10;
__CENTER = [49.5, 5.95];
__POSITION_CIRCLE_RADIUS = 10;
__GPS_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 60000,
};
__GPS_STATUS_TIMEOUT = 3000;
__ACCURACY_THRESHOLD = 250;

// Enquête sur la représentativité
__MAX_CAR_OWNERSHIP = 10;
__MAX_PERSONS_PER_HOUSEHOLD = 20;

// Cartographie
__TILE_PROVIDER = "OpenStreetMap.Mapnik";

// Système de notification
__NOTIFICATION = {
    closeButton: false,
    debug: false,
    newestOnTop: false,
    progressBar: false,
    positionClass: "toast-top-right",
    preventDuplicates: true,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "5000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
};

__NOTIFICATION_TIMEOUT = 5000;