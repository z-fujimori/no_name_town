import { useRef, useEffect } from "react";
import { useCamera } from "../hooks/useCamera";

export default function CameraSample() {
    

    const { videoRef } = useCamera();

    return <video ref={videoRef} autoPlay muted playsInline />;

}