export function get_orientation_from_bearing(bearing, division) {
    if (!division) division = 8;
    const compass = 
        division === 16 ? 
            [ 
                "N", "NNE", "NE", "ENE", 
                "E", "ESE", "SE", "SSE", 
                "S", "SSO", "SO", "OSO", 
                "O", "ONO", "NO", "NNO",
            ] : 
        division === 8 ? [ "N", "NE", "E", "SE", "S", "SO", "O", "NO" ] : 
        division === 4 ? [ "N", "E", "S", "O" ] : 
        undefined;
    if (!compass) return;
    const sector = 360 / division;
    bearing += sector / 2;
    if (bearing <= 0) bearing += 360 ;
    const orientation = Math.ceil(bearing/sector) - 1;
    return compass[orientation] ;
}