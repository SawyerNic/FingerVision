import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';


const MyMapComponent = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const geocoderRef = useRef(null);

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  geocoderRef.current = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
  });

  const setGeocoderInput = (input) => {
    geocoderRef.current.setInput(input);
  }

  useEffect(() => {


    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-79.4512, 43.6568],
      zoom: 13
    });


    mapRef.current.addControl(
      geocoderRef.current
    );

    setGeocoderInput('Toronto');

    return () => mapRef.current.remove();
  }, []);

  return  (
      <div ref={mapContainerRef} style={{ height: '100%' }} />
  );
};

export default MyMapComponent;
