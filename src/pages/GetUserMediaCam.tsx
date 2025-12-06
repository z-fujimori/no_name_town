import React, { useEffect, useRef, useState } from 'react'

const GetUserMediaCam = () => {
  const width = 320;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [streaming, setStreaming] = useState(false);
  const heightRef = useRef<number>(0);

    useEffect(() => {
        let stream: MediaStream | null = null;
        async function start() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (!videoRef.current) return;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
        } catch (err) {
            console.error("getUserMedia error:", err);
        }
        }

        const onCanPlay = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || streaming) return;
        let height = video.videoHeight / (video.videoWidth / width);
        if (isNaN(height)) height = width / (4 / 3);
        heightRef.current = height;
        video.width = width;
        video.height = height;
        canvas.width = width;
        canvas.height = height;
        setStreaming(true);
        };

        start();
        const v = videoRef.current;
        v?.addEventListener("canplay", onCanPlay);

        return () => {
        v?.removeEventListener("canplay", onCanPlay);
        if (stream) {
            stream.getTracks().forEach((t) => t.stop());
        }
        };
    }, [streaming]);

    function clearPhoto() {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#AAA";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL("image/png");
        img.src = data;
    }

    function takePicture() {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const img = imgRef.current;
        const height = heightRef.current;
        if (!video || !canvas || !img) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(video, 0, 0, width, height);
        const data = canvas.toDataURL("image/png");
        img.src = data;
    }

    // 初期はプレースホルダを表示
    useEffect(() => {
        console.log("Clearing photo on mount");
        clearPhoto();
    }, []);

    return (
        <div className="contentarea">
            <h1>Still photo capture demo</h1>
            <div className="camera">
            <video id="video" ref={videoRef}>Video stream not available.</video>
            <button id="startbutton" onClick={() => takePicture()}>
                Take photo
            </button>
            </div>
            <canvas id="canvas" ref={canvasRef} style={{ display: "none" }} />
            <div className="output">
            <img id="photo" alt="The screen capture will appear in this box." ref={imgRef} />
            </div>
        </div>
    );
}

export default GetUserMediaCam