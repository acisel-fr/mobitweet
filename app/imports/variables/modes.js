export const modes = [
    { 
        code: 'walk', 
        label: 'Marche', 
        icon: 'directions_run',
        max_speed: 6, // 20 km/h
    },
    { 
        code: 'bike', 
        label: 'Vélo, trottinette', 
        icon: 'directions_bike',
        max_speed: 11, // 40 km/h
    },
    { 
        code: 'wheel-chair', 
        label: 'Fauteuil roulant', 
        icon: 'accessible',
        max_speed: 2, // 8 km/h
    },
    { 
        code: 'bus', 
        label: 'Bus urbain', 
        isPT: true, 
        icon: 'directions_bus',
        max_speed: 14, // 50 km/h
    },
    { 
        code: 'autocar', 
        label: 'Autocar', 
        isPT: true, 
        icon: 'airport_shuttle',
        max_speed: 35, // 120 km/h
    },
    { 
        code: 'tramway', 
        label: 'Tramway', 
        isPT: true, 
        icon: 'tram',
        max_speed: 14, // 50 km/h
    },
    { 
        code: 'metro', 
        label: 'Métro', 
        isPT: true, 
        icon: 'subway',
        max_speed: 14, // 50 km/h
    },
    { 
        code: 'train', 
        label: 'Train régional', 
        isPT: true, 
        icon: 'train',
        max_speed: 56, // 200 km/h
    },
    { 
        code: 'tgv', 
        label: 'Train à grande vitesse', 
        isPT: true, 
        icon: 'directions_railway',
        max_speed: 90, // 320 km/h
    },
    { 
        code: 'boat', 
        label: 'Bateau', 
        isPT: true, 
        icon: 'directions_boat',
        max_speed: 8, // 30 km/h
    },
    { 
        code: 'airplane', 
        label: 'Avion', 
        isPT: true, 
        icon: 'flight',
        max_speed: 140, // 500 km/h
    },
    { 
        code: 'taxi', 
        label: 'Taxi', 
        icon: 'local_taxi',
        max_speed: 42, // 150 km/h
    },
    { 
        code: 'car', 
        label: 'Voiture', 
        icon: 'directions_car',
        max_speed: 42, // 150 km/h
    },
    { 
        code: 'motorbike', 
        label: 'Motocyclette', 
        icon: 'motorcycle',
        max_speed: 42, // 150 km/h
    },
    { 
        code: 'other', 
        label: 'Autre', 
        icon: 'radio_button_unchecked',
        max_speed: 14, // 50 km/h
    },
];