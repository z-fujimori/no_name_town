import { use, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "../App.css";
import { listen } from "@tauri-apps/api/event";

function WebcamComponent() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // アプリ起動時にカメラ開始
    invoke("start_camera").catch(console.error);

    // "camera-frame" イベントを購読
    const unlistenPromise = listen<string>("camera-frame", (event) => {
      const b64 = event.payload; // Rust側で base64 にした文字列

      console.log("Received camera frame event with size:", b64.length);

      if (!b64 || b64.length === 0) return;

      // "data:image/jpeg;base64,..." の形式で <img> に渡せる
      const src = `data:image/png;base64,${b64}`;
      console.log("Setting image URL: ", src.substring(0, 30) + "...");
      setImageUrl(src);
    });

    return () => {
      // クリーンアップ：イベント購読解除＆カメラ停止
      unlistenPromise.then((unlisten) => unlisten());
      invoke("stop_camera").catch(console.error);
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "#fff",
        fontFamily: "monospace",
      }}
    >
      <a href="/">go Home</a>
      <div style={{ marginBottom: 16 }}>10秒おきに最新フレームを更新</div>
      {imageUrl ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* 固定サイズと枠を付けて確実に見えるようにする */}
          <img
            src={imageUrl}
            style={{ width: 200, height: 200, objectFit: "contain", border: "2px solid #0f0", borderRadius: 8 }}
            alt="camera frame"
          />
          {/* 生の data URL の先頭を表示（デバッグ用） */}
          <pre style={{ maxWidth: "80vw", maxHeight: 120, overflow: "auto", color: "#0f0", marginTop: 8 }}>
            {imageUrl.substring(0, 200)}{imageUrl.length > 200 ? "..." : ""}
          </pre>
        </div>
      ) : (
        <div>まだ画像がありません…</div>
      )}
    </div>
  );
}

export default WebcamComponent;
