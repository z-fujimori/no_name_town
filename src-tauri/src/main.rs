// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "macos")]

use std::{
    sync::{Arc, Mutex},
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use tauri::{Manager, Emitter};

/// カメラキャプチャの状態共有用
struct CameraState {
    running: bool,
}

// 1x1 の赤い PNG を base64 で埋め込んだもの
const TEST_IMAGE_B64: &str = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

// ここに実際のカメラキャプチャロジックを実装する想定。
// 今はダミーとして、毎回同じバイト列を返す関数にしておきます。
fn capture_frame_dummy() -> Vec<u8> {
    // 本来は AVFoundation を叩いて JPEG/PNG バイト列を返す
    // ここでは「ホワイトの1x1 png」などのダミーを返しておく
    // 実装例として base64 で埋め込んだものをdecodeして返してもよい
    // vec![]
    base64::decode(TEST_IMAGE_B64).expect("invalid base64")
}

/// カメラを開始するコマンド
#[tauri::command]
fn start_camera(app_handle: tauri::AppHandle) {
    println!("start_camera called");

    let state = app_handle.state::<Arc<Mutex<CameraState>>>();
    {
        let mut s = state.lock().unwrap();
        if s.running {
            // すでに起動済みなら何もしない
            return;
        }
        s.running = true;
    }

    // バックグラウンドスレッドで10秒おきにキャプチャ
    std::thread::spawn(move || {
        loop {
            // ループごとに running フラグを見る
            {
                // 👇 ここを1行チェインではなく2段階にする
                let state: tauri::State<Arc<Mutex<CameraState>>> =
                    app_handle.state();
                let s = state.lock().unwrap();

                if !s.running {
                    break;
                }
            }

            // ここでフレーム取得
            let frame_bytes = capture_frame_dummy();
            let b64 = base64::encode(&frame_bytes);
            let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

            println!("emitting camera-frame event with image size: {}", frame_bytes.len());

            if let Err(e) = app_handle.emit("camera-frame", b64 + &timestamp.to_string()) {
                eprintln!("failed to emit camera-frame event: {e}");
            }

            // 10秒休む
            thread::sleep(Duration::from_secs_f64(6.11));
        }
    });
}

/// カメラを停止するコマンド（任意）
#[tauri::command]
fn stop_camera(app_handle: tauri::AppHandle) {
    let state = app_handle.state::<Arc<Mutex<CameraState>>>();
    let mut s = state.lock().unwrap();
    s.running = false;
}

fn main() {
    tauri::Builder::default()
        .manage(Arc::new(Mutex::new(CameraState { running: false })))
        .invoke_handler(tauri::generate_handler![start_camera, stop_camera])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
