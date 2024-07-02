// gestureWorker.js

self.onmessage = async (e) => {
    const { action, data } = e.data;
  
    switch (action) {
      case 'estimateGestures':
        // Perform gesture estimation here
        console.log(e.data);
        // For example, using a hypothetical gestureEstimation function
        const estimatedGestures = await gestureEstimation(data.image);
        self.postMessage({ action: 'estimatedGestures', data: estimatedGestures });
        break;
  
      // Handle other actions
    }
  };