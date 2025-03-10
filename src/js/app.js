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
    const post = new TextPost(text, this.timeline.posts);
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

  async createAudioPost() {
    const post = new AudioPost("", [], this.timeline.posts);
    try {
      await post.startRecording();
      await post.getCoordinates();
      this.timeline.addPost(post);
    } catch (error) {
      console.error("Ошибка аудио-записи:", error);
      alert("Не удалось создать аудио-запись");
    }
  }

  async createVideoPost() {
    const post = new VideoPost("", [], this.timeline.posts);
    try {
      await post.startRecording();
      await post.getCoordinates();
      this.timeline.addPost(post);
    } catch (error) {
      console.error("Ошибка видео-записи:", error);
      let errorMessage = "Не удалось создать видео-запись";

      if (error.message.includes("allocate videosource")) {
        errorMessage += ". Камера недоступна или уже используется";
      } else if (error.message.includes("permission")) {
        errorMessage += ". Разрешите доступ к камере в настройках браузера";
      }

      alert(errorMessage);
    }
  }
}
