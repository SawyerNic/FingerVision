import React, { useRef, useState, useEffect } from "react"
import * as handpose from "@tensorflow-models/handpose"
import Webcam from "react-webcam"
import { drawHand } from "../components/handposeutil"
import * as fp from "fingerpose"
import * as tf from "@tensorflow/tfjs"
import Handsigns from "../components/handsigns"
import dynamic from 'next/dynamic';
import Map from "react-map-gl";
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';



import {
  Text,
  Heading,
  Button,
  Image,
  Stack,
  Container,
  Box,
  VStack,
  ChakraProvider,
} from "@chakra-ui/react"

// Signimage is object with k/v pairs alphabet to image source
// SignPass is an array of objects with src and alt keys
import { Signimage } from "../components/handimage"

import About from "../components/about"
import Metatags from "../components/metatags"


import { RiCameraFill, RiCameraOffFill } from "react-icons/ri"

export default function Home() {


  let searchTerm = "";
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)

  const [camState, setCamState] = useState("on")

  const [sign, setSign] = useState(null)

  async function runHandpose() {
    const net = await handpose.load()

    // window.requestAnimationFrame(loop);

    setInterval(() => {
      detect(net)
    }, 30)
  }

  //loading the fingerpose model
  const GE = new fp.GestureEstimator([
    fp.Gestures.ThumbsUpGesture,
    Handsigns.aSign,
    Handsigns.bSign,
    Handsigns.cSign,
    Handsigns.dSign,
    Handsigns.eSign,
    Handsigns.fSign,
    Handsigns.gSign,
    Handsigns.hSign,
    Handsigns.iSign,
    Handsigns.jSign,
    Handsigns.kSign,
    Handsigns.lSign,
    Handsigns.mSign,
    Handsigns.nSign,
    Handsigns.oSign,
    Handsigns.pSign,
    Handsigns.qSign,
    Handsigns.rSign,
    Handsigns.sSign,
    Handsigns.tSign,
    Handsigns.uSign,
    Handsigns.vSign,
    Handsigns.wSign,
    Handsigns.xSign,
    Handsigns.ySign,
    Handsigns.zSign,
  ])

  let detectionCount = 0;
  let lastSign = null;

  const mapContainerRef = useRef();
  const mapRef = useRef();
  const geocoderRef = useRef(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-79.4512, 43.6568],
        zoom: 13
      });

      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      });

      map.addControl(geocoder);
      mapRef.current = map;
      geocoderRef.current = geocoder;
      new mapboxgl.Marker()
      .setLngLat([-77.6256, 43.1226])
      .addTo(map); 

    }
  }, []); // Empty dependency array ensures this runs once on mount

  async function detect(net) {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video
      const videoWidth = webcamRef.current.video.videoWidth
      const videoHeight = webcamRef.current.video.videoHeight

      // Set video width
      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight

      // Set canvas height and width
      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight

      // Make Detections
      const hand = await net.estimateHands(video)

      // Draw hand lines
      const ctx = canvasRef.current.getContext("2d")
      drawHand(hand, ctx)

      if (hand.length > 0) {

        const estimatedGestures = hand.length > 0 && await GE.estimate(hand[0].landmarks, 6.5);
        const highestConfidenceGesture = (estimatedGestures.gestures && estimatedGestures.gestures.length > 0 ? estimatedGestures.gestures : [{ confidence: -Infinity }])
          .reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current);
        setSign(highestConfidenceGesture.name)
        if (highestConfidenceGesture.name === lastSign) {
          detectionCount++;
        } else {
          detectionCount = 0;
          lastSign = highestConfidenceGesture.name;
        }

        if (detectionCount > 10 && highestConfidenceGesture.name) {
          searchTerm = highestConfidenceGesture.name;
          // Assuming geocoderRef.current correctly references your geocoder instance
          if (geocoderRef.current) {
            console.log('Setting input on geocoder:', highestConfidenceGesture.name);

            geocoderRef.current.setInput(highestConfidenceGesture.name);
            if (highestConfidenceGesture.name === "H") {
              searchTerm = "Strong Hospital";
              mapRef.current.flyTo({center: [-77.6256, 43.1226], zoom: 15});
            }
          }
        }

      }
      geocoderRef.current.setInput(searchTerm);
    }
  }

  useEffect(() => {
    runHandpose()
  }, [])

  function turnOffCamera() {
    if (camState === "on") {
      setCamState("off")
    } else {
      setCamState("on")
    }
  }

  return (
    <ChakraProvider>
      <Metatags />
      <Box style={{ display: 'flex', flexDirection: 'row' }}> {/* Parent flex container */}
        <Box bgColor="#5784BA" style={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}> {/* Updated this line */}
          <Container centerContent maxW="xl" height="100vh" pt="0" pb="0">
            <VStack spacing={4} align="center">
              <Box h="20px"></Box>
              <Heading
                as="h3"
                size="md"
                className="tutor-text"
                color="white"
                textAlign="center"
              ></Heading>
              <Box h="20px"></Box>
            </VStack>

            <Box id="webcam-container" style={{ width: '50%', float: 'left' }}>
              {camState === "on" ? (
                <Webcam id="webcam" ref={webcamRef} style={{ width: '50%', float: 'left', display: 'flex', flexDirection: 'column' }} />
              ) : (
                <div id="webcam" background="black"></div>
              )}

              {sign ? (
                <div
                  style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    right: "calc(50% - 50px)",
                    bottom: 100,
                    textAlign: "-webkit-center",
                  }}
                >
                  <Text color="black" fontSize="sm" mb={1}>
                    detected gestures
                  </Text>
                  <img
                    alt="signImage"
                    src={
                      Signimage[sign]?.src
                        ? Signimage[sign].src
                        : "/loveyou_emoji.svg"
                    }
                    style={{
                      height: 30,
                    }}
                  />
                </div>
              ) : (
                " "
              )}
              <canvas id="gesture-canvas" ref={canvasRef} style={{ width: '50%', display: 'flex', flexDirection: 'column', float: 'left' }} />

              <Image h="150px" objectFit="cover" id="emojimage" />
              <Stack id="start-button" direction="row" style={{ position: 'absolute', width: '100%', display: 'flex', float: 'left' }}>
                <Button
                  leftIcon={
                    camState === "on" ? (
                      <RiCameraFill size={20} />
                    ) : (
                      <RiCameraOffFill size={20} />
                    )
                  }
                  onClick={turnOffCamera}
                  colorScheme="orange"
                >
                  Camera
                </Button>
                <About />
              </Stack>
            </Box>


          </Container>


        </Box>
        <Box style={{ width: '50%' }}>
          <div ref={mapContainerRef} style={{ height: '100%' }} />
        </Box>
      </Box>
    </ChakraProvider>
  )
}
