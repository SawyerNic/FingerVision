import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import GeocoderContext from './GeoContext.jsx';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const MyMapComponent = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const geocoderRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-79.4512, 43.6568],
      zoom: 13
    });

    geocoderRef.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    })



    mapRef.current.addControl(
      geocoderRef.current
    );

    geocoderRef.current.setInput('yolo');

    return () => mapRef.current.remove();
  }, []);

  return  (
    <GeocoderContext.Provider value={{ setInput: (text) => geocoderRef.current?.setInput(text) }}>
      <div ref={mapContainerRef} style={{ height: '100%' }} />
    </GeocoderContext.Provider>
  );
};


export default MyMapComponent;