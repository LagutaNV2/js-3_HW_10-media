// app.js
// Главный файл приложения
import Timeline from "./Timeline.js";
import TextPost from "./TextPost.js";
import AudioPost from "./AudioPost.js";
import VideoPost from "./VideoPost.js";

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
});

export default class App {
  constructor() {
    this.timeline = new Timeline();
  }

  init() {
    this.timeline.init(document.body);

    // Обработка ввода текста
    const inputField = document.querySelector(".input-field");
    inputField.addEventListener("keypress", (event) => {
      if (event.key === "Enter" && inputField.value.trim()) {
        this.createTextPost(inputField.value);
        inputField.value = "";
      }
    });

    // Обработка записи аудио
    const audioButton = document.querySelector(".audio-button");
    audioButton.addEventListener("click", () => {
      this.createAudioPost();
    });

    // Обработка записи видео
    const videoButton = document.querySelector(".video-button");
    videoButton.addEventListener("click", () => {
      this.createVideoPost();
    });

    document
      .querySelector(".cancel-recording")
      .addEventListener("click", () => {
        if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
          this.mediaRecorder.stop();
          this.showMediaButtons();
          clearInterval(this.timerInterval);
          if (this.type === "video") {
            this.stopVideoPreview(this.stream); // Останавливаем предпросмотр видео
          }
        }
      });

    document
      .querySelector(".confirm-recording")
      .addEventListener("click", () => {
        if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
          this.mediaRecorder.stop();
        }
      });
  }

  async checkDeviceAvailability() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(
        (device) => device.kind === "videoinput",
      );
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput",
      );

      if (videoInputs.length === 0) {
        throw new Error("Камера недоступна.");
      }
      if (audioInputs.length === 0) {
        throw new Error("Микрофон недоступен.");
      }
    } catch (error) {
      console.error("Ошибка при проверке устройств:", error.message);
      alert(`Ошибка: ${error.message}`);
    }
  }

  createTextPost(text) {
    const post = new TextPost(text);
    post
      .getCoordinates()
      .then(() => {
        this.timeline.addPost(post);
      })
      .catch((error) => {
        console.error("Ошибка при получении координат:", error.message);
        alert("Не удалось получить координаты. Попробуйте снова.");
      });
  }

  createAudioPost() {
    this.checkDeviceAvailability().then(() => {
      const post = new AudioPost("", [], this.timeline.posts);
      post
        .startRecording()
        .then(() => {
          return post.getCoordinates();
        })
        .then(() => {
          this.timeline.addPost(post);
        })
        .catch((error) => {
          console.error("Ошибка при создании аудио-записи:", error.message);
          alert("Не удалось создать аудио-запись. Попробуйте снова.");
        });
    });
  }

  createVideoPost() {
    this.checkDeviceAvailability().then(() => {
      const post = new VideoPost("", [], this.timeline.posts);
      post
        .startRecording()
        .then(() => {
          return post.getCoordinates();
        })
        .then(() => {
          this.timeline.addPost(post);
        })
        .catch((error) => {
          console.error("Ошибка при создании видео-записи:", error.message);
          alert("Не удалось создать видео-запись. Попробуйте снова.");
        });
    });
  }

  hideMediaButtons() {
    document.querySelector(".audio-button").style.display = "none";
    document.querySelector(".video-button").style.display = "none";
    document.querySelector(".media-controls").style.display = "flex";
  }

  showMediaButtons() {
    document.querySelector(".audio-button").style.display = "block";
    document.querySelector(".video-button").style.display = "block";
    document.querySelector(".media-controls").style.display = "none";
    document.querySelector(".recording-timer").textContent = "00:00";
  }

  updateTimer(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    document.querySelector(".recording-timer").textContent = `${mins}:${secs}`;
  }
}
