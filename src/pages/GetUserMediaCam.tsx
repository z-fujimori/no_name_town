import React, { useEffect, useRef, useState } from 'react'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs'

const width = 320
const DETECT_INTERVAL_MS = 2000

type Prediction = cocoSsd.DetectedObject

const phoneLikeClasses = [
    'cell phone',
    'mobile phone',
    'laptop',
    'tablet',
    'remote',
    'mouse',
]

const isUsingPhone = (preds: Prediction[]): boolean => {
    // 人とスマホがいるか確認
    // console.log('Predictions:', preds)
    console.log('👦Persons:', preds.filter(p => p.class === 'person'))
    console.log(
        '📱Phones:',
        preds.filter(
        p =>
            phoneLikeClasses.includes(p.class) &&
            p.score > 0.15, // ここも 0.2〜0.3 くらいまで下げてOK
        )
    )

    const persons = preds.filter(p => p.class === 'person' && p.score > 0.3)
    const phones = preds.filter(
        p =>
            phoneLikeClasses.includes(p.class) &&
            p.score > 0.15, // ここも 0.2〜0.3 くらいまで下げてOK
    )

    if (!persons.length || !phones.length) return false

    // ざっくり：「スマホが人の bbox の下半分にある」→ いじってるっぽい
    for (const p of persons) {
        const [px, py, pw, ph] = p.bbox
        const handAreaTop = py + ph * 0.1
        const handAreaBottom = py + ph * 1.0
        const personRight = px + pw

        for (const phn of phones) {
            const [fx, fy, fw, fh] = phn.bbox
            const centerX = fx + fw / 2
            const centerY = fy + fh / 2

            const expandX = pw * 0.5; // bbox余裕を追加

            const withinX = centerX >= px && centerX <= personRight
            const withinY = centerY >= handAreaTop && centerY <= handAreaBottom

            if (withinX && withinY) {
                return true
            }
        }
    }

    return false
}

const GetUserMediaCam = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [streaming, setStreaming] = useState(false)
  const heightRef = useRef<number>(0)
  const [usingPhone, setUsingPhone] = useState(false)

  // カメラ起動 & サイズ決定
    useEffect(() => {
        let stream: MediaStream | null = null

        async function start() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false,
            })
            if (!videoRef.current) return
            videoRef.current.srcObject = stream
            await videoRef.current.play()
        } catch (err) {
            console.error('getUserMedia error:', err)
        }
        }

        const onCanPlay = () => {
            const video = videoRef.current
            const canvas = canvasRef.current
            if (!video || !canvas || streaming) return
            let height = video.videoHeight / (video.videoWidth / width)
            if (isNaN(height)) height = width / (4 / 3)
            heightRef.current = height
            video.width = width
            video.height = height
            canvas.width = width
            canvas.height = height
            setStreaming(true)
        }

        start()
        const v = videoRef.current
        v?.addEventListener('canplay', onCanPlay)

        return () => {
        v?.removeEventListener('canplay', onCanPlay)
        if (stream) {
            stream.getTracks().forEach(t => t.stop())
        }
        }
    }, [streaming])

    // 画像クリア
    function clearPhoto() {
        const canvas = canvasRef.current
        const img = imgRef.current
        if (!canvas || !img) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.fillStyle = '#AAA'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        const data = canvas.toDataURL('image/png')
        img.src = data
    }

    // 手動で1枚撮影
    function takePicture() {
        const video = videoRef.current
        const canvas = canvasRef.current
        const img = imgRef.current
        const height = heightRef.current
        if (!video || !canvas || !img) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        canvas.width = width
        canvas.height = height
        ctx.drawImage(video, 0, 0, width, height)
        const data = canvas.toDataURL('image/png')
        img.src = data
    }

    // 初期プレースホルダ
    useEffect(() => {
        clearPhoto()
    }, [])

    // ★ ここが追加部分：coco-ssd で1〜5秒ごとに判定
    useEffect(() => {
        let cancelled = false
        let timer: number | undefined
        let model: cocoSsd.ObjectDetection | null = null

        const loadAndDetect = async () => {
            if (!model) {
                model = await cocoSsd.load()
            }
            const video = videoRef.current
            if (!video || video.readyState < 2) {
                // まだ映像が入っていない
                timer = window.setTimeout(loadAndDetect, 500)
                return
            }

            try {
                const preds = (await model.detect(video)) as Prediction[]
                const result = isUsingPhone(preds)
                if (!cancelled) {
                setUsingPhone(result)
                }
            } catch (e) {
                console.error('detect error', e)
            }

            if (!cancelled) {
                timer = window.setTimeout(loadAndDetect, DETECT_INTERVAL_MS)
            }
        }

        loadAndDetect()

        return () => {
            cancelled = true
            if (timer !== undefined) window.clearTimeout(timer)
        }
    }, [])

    return (
        <div className="contentarea">
          <h1>Still photo capture + Phone detection</h1>

            <div
                style={{
                marginBottom: 8,
                padding: '4px 8px',
                borderRadius: 4,
                background: usingPhone ? '#ff5252' : '#4caf50',
                color: '#fff',
                display: 'inline-block',
                }}
            >
                {usingPhone ? '📱 スマホいじってるっぽい' : '🙅‍♂️ いじってなさそう'}
            </div>

            <div className="camera">
                <video id="video" ref={videoRef}>
                Video stream not available.
                </video>
                <button id="startbutton" onClick={() => takePicture()}>
                Take photo
                </button>
            </div>

            <canvas id="canvas" ref={canvasRef} style={{ display: 'none' }} />

            <div className="output">
                <img
                id="photo"
                alt="The screen capture will appear in this box."
                ref={imgRef}
                />
            </div>
        </div>
    )
}

export default GetUserMediaCam
