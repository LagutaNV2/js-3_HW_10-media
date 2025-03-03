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
  }

  createVideoPost() {
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
  }
}
