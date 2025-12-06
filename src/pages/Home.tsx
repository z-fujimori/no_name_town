import React from 'react'

const Home = () => {
  return (
    <div>
        <h1>Welcome to the Home Page</h1>
        <div>
            <a href="/streamCam">Go to Webcam Stream</a>
            <a href="/getUserMediaCam" style={{ marginLeft: 16 }}>Go to getUserMedia Cam</a>
        </div>
    </div>
  )
}

export default Home