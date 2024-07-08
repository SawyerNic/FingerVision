import React, { useRef, useState, useEffect } from "react"
import * as handpose from "@tensorflow-models/handpose"
import Webcam from "react-webcam"
import { drawHand } from "../components/handposeutil"
import * as fp from "fingerpose"
import Handsigns from "../components/handsigns"
import dynamic from 'next/dynamic';


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

const MyAddressForm = dynamic(() => import('./MyAddressForm.jsx'), {
  ssr: false,
});

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

        const estimatedGestures = await GE.estimate(hand[0].landmarks, 6.5)
        console.log(estimatedGestures.gestures.map(p => `${p.name}: ${p.confidence.toFixed(2)}`).join(', '))

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
    <Box style={{ width: '50%', float: 'left', display: 'flex', flexDirection: 'column' }}>
    <ChakraProvider >
      <Metatags />
      <Box bgColor="#5784BA">
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

          <Heading
            as="h1"
            size="lg"
            id="app-title"
            color="white"
            textAlign="center"
          >
            🧙‍♀️ Loading the Magic 🧙‍♂️
          </Heading>

          <Box id="webcam-container">
            {camState === "on" ? (
              <Webcam id="webcam" ref={webcamRef} style={{ width: '50%', float: 'left', display: 'flex', flexDirection: 'column' }}/>
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
                <Text color="white" fontSize="sm" mb={1}>
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

          <canvas id="gesture-canvas" ref={canvasRef} style={{ width: '50%', float: 'left', display: 'flex', flexDirection: 'column' }} />

          <Box
            id="singmoji"
            style={{
              zIndex: 9,
              position: "fixed",
              top: "50px",
              right: "30px",
            }}
          ></Box>

          <Image h="150px" objectFit="cover" id="emojimage" />
          {/* <pre className="pose-data" color="white" style={{position: 'fixed', top: '150px', left: '10px'}} >Pose data</pre> */}
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
    </ChakraProvider>
    </Box>
  )
}
