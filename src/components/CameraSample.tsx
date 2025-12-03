import { useRef, useEffect } from "react";

export default function CameraSample() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("カメラ取得に失敗:", err);
      }
    };

    start();
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        ref={videoRef}
        style={{ maxWidth: "100%", maxHeight: "100%" }}
        playsInline
        muted
      />
    </div>
  );
}