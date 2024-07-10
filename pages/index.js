import React, { useRef, useState, useEffect } from "react"
import * as handpose from "@tensorflow-models/handpose"
import Webcam from "react-webcam"
import { drawHand } from "../components/handposeutil"
import * as fp from "fingerpose"
import * as tf from "@tensorflow/tfjs"
import Handsigns from "../components/handsigns"
import dynamic from 'next/dynamic';
import Map from "react-map-gl";

import MyMapComponent from './MapComponent';

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
import { Signimage, Signpass } from "../components/handimage"

import About from "../components/about"
import Metatags from "../components/metatags"


import { RiCameraFill, RiCameraOffFill } from "react-icons/ri"

export default function Home() {
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

        if (detectionCount > 10) {
          console.log(highestConfidenceGesture.name);
        }

        //console.log(Math.max(...estimatedGestures.confidence))
        //console.log(estimatedGestures.gestures.map(p => `${p.name}: ${p.confidence.toFixed(2)}`).join(', '))

        // document.querySelector('.pose-data').innerHTML =JSON.stringify(estimatedGestures.poseData, null, 2);

      }
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
      <Box bgColor="#5784BA" style={{ width: '50%', display: 'flex', flexDirection: 'column' }}> {/* Existing content */}
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


          <Box id="webcam-container">
            {camState === "on" ? (
              <Webcam id="webcam" ref={webcamRef} style={{ width: '50%', float: 'left', display: 'flex', flexDirection: 'column'}} />
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
          </Box>

          <canvas id="gesture-canvas" ref={canvasRef} style={{ width: '100%', display: 'flex', flexDirection: 'column' }} />

          <Image h="150px" objectFit="cover" id="emojimage" />
        </Container>

        <Stack id="start-button" spacing={4} direction="row" align="center" >
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
      <Box style={{ width: '50%'}}> {/* Map container */}
        {/* <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          initialViewState={{
            longitude: -122.4,
            latitude: 37.8,
            zoom: 14
          }}
          style={{ width: '80%', height: '80vh', margin: '60px', position: "fixed",
          }} // Adjusted to take full height of the viewport
          mapStyle="mapbox://styles/mapbox/streets-v9"
        /> */}
        <MyMapComponent />
      </Box>
    </Box>
  </ChakraProvider>
)
}
