/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/js/Post.js
// Базовый класс для всех типов записей
class Post {
  constructor(type, content, coordinates, posts) {
    this.type = type;
    this.content = content;
    this.coordinates = coordinates;
    this.timestamp = new Date();
    this.posts = posts; // Ссылка на массив всех записей
  }
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result.split(",")[1]); // Убираем префикс "data:..."
        } else {
          reject(new Error("Failed to read Blob as Base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  async getCoordinates() {
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(position => {
          this.coordinates = [position.coords.latitude, position.coords.longitude];
          resolve();
        }, async () => {
          try {
            const coords = await this.showManualCoordinatesModal();
            this.coordinates = coords;
            resolve();
          } catch (error) {
            console.warn("Ручной ввод координат отменен");
            resolve();
          }
        });
      });
    } else {
      try {
        const coords = await this.showManualCoordinatesModal();
        this.coordinates = coords;
      } catch (error) {
        console.warn("Ручной ввод координат отменен");
      }
    }
  }
  showManualCoordinatesModal() {
    return new Promise((resolve, reject) => {
      const modal = document.createElement("div");
      modal.className = "modal";
      modal.innerHTML = `
        <p>Что-то пошло не так. Дайте разрешение на использование гелокации или введите координаты вручную:</p>
        <p>Пример формата: 51.50851, -0.12572</p>
        <input type="text" placeholder="Широта, Долгота" />
        <button class="cancel-btn">Отмена</button>
        <button class="ok-btn">ОК</button>
      `;
      document.body.appendChild(modal);
      const input = modal.querySelector("input");
      const cancelBtn = modal.querySelector(".cancel-btn");
      const okBtn = modal.querySelector(".ok-btn");
      cancelBtn.addEventListener("click", () => {
        console.log("Ручной ввод координат отменен");
        document.body.removeChild(modal);
        reject();
      });
      okBtn.addEventListener("click", () => {
        try {
          const coords = this.parseCoordinates(input.value);
          console.log("Координаты успешно введены:", coords);
          document.body.removeChild(modal);
          resolve(coords);
        } catch (error) {
          console.warn("Ошибка при вводе координат:", error.message);
          alert("Неверный формат координат. Используйте: 'широта, долгота'");
        }
      });
    });
  }
  parseCoordinates(input) {
    // Удаляем пробелы и квадратные скобки, заменяем альтернативный минус на стандартный
    // input = input
    //   .trim()
    //   .replace(/[\[\]]/g, "")
    //   .replace(/\u2212/g, "-");

    input = input.trim().replace(/[[]/g, "").replace(/\u2212/g, "-");
    const parts = input.split(/\s*,\s*/);
    if (parts.length !== 2) {
      throw new Error("Invalid coordinates format");
    }
    const latitude = parseFloat(parts[0]);
    const longitude = parseFloat(parts[1]);
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error("Invalid coordinates format");
    }
    return [latitude, longitude];
  }
  toJSON() {
    return {
      type: this.type,
      content: this.content,
      coordinates: this.coordinates,
      timestamp: this.timestamp.toISOString()
    };
  }
  render() {
    const postElement = document.createElement("div");
    postElement.className = "post";
    postElement.innerHTML = `
      <div class="post-left">
        ${this.renderContent()}
        <div class="post-coordinates">[${Array.isArray(this.coordinates) ? this.coordinates.join(", ") : "N/A"}]</div>
      </div>
      <div class="post-right">
        <div class="post-time">${this.formatTimestamp()}</div>
        <button class="delete-btn">×</button>
      </div>
    `;
    const deleteBtn = postElement.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      this.onDelete();
      postElement.remove();
    });
    return postElement;
  }
  renderContent() {
    return `<p>${this.content}</p>`;
  }
  formatTimestamp() {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };
    return new Intl.DateTimeFormat("ru-RU", options).format(this.timestamp);
  }
  onDelete() {
    const index = this.posts.indexOf(this);
    if (index !== -1) {
      this.posts.splice(index, 1);
      this.saveToLocalStorage();
    }
  }
  saveToLocalStorage() {
    const postData = this.posts.map(post => post.toJSON());
    localStorage.setItem("timeline-posts", JSON.stringify(postData));
  }
}
;// ./src/js/TextPost.js
// Класс для текстовых записей

class TextPost extends Post {
  constructor(content, coordinates, posts) {
    super("text", content, coordinates, posts);
  }
}
;// ./src/js/AudioPost.js
// Класс для аудио-записей

class AudioPost extends Post {
  constructor(content, coordinates, posts) {
    super("audio", content, coordinates, posts);
    this.mediaBlob = null;
  }
  async startRecording() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({
        audio: true
      }).then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];
        mediaRecorder.ondataavailable = event => {
          chunks.push(event.data);
        };
        mediaRecorder.onstop = async () => {
          this.mediaBlob = new Blob(chunks, {
            type: "audio/webm"
          });
          // this.content = URL.createObjectURL(this.mediaBlob);
          this.content = await this.blobToBase64(this.mediaBlob); // Используем метод из базового класса
          resolve();
        };
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 5000); // Запись 5 секунд
      }).catch(reject);
    });
  }
  renderContent() {
    const src = `data:audio/webm;base64,${this.content}`; // Создаем URL из Base64
    return `<audio controls src="${src}"></audio>`;
  }
}
;// ./src/js/VideoPost.js
// Класс для видео-записей

class VideoPost extends Post {
  constructor(content, coordinates, posts) {
    super("video", content, coordinates, posts);
    this.mediaBlob = null;
  }
  async startRecording() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];
        mediaRecorder.ondataavailable = event => {
          chunks.push(event.data);
        };
        mediaRecorder.onstop = async () => {
          this.mediaBlob = new Blob(chunks, {
            type: "video/webm"
          });
          // this.content = URL.createObjectURL(this.mediaBlob);
          this.content = await this.blobToBase64(this.mediaBlob); // Используем метод из базового класса
          resolve();
        };
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 5000); // Запись 5 секунд
      }).catch(reject);
    });
  }
  renderContent() {
    const src = `data:video/webm;base64,${this.content}`; // Создаем URL из Base64
    return `<video controls src="${src}"></video>`;
  }
}
;// ./src/js/Timeline.js
// Класс для управления Timeline



class Timeline {
  constructor() {
    this.posts = [];
    this.container = null;
  }
  init(container) {
    this.container = container;

    // Загрузка записей из localStorage
    const savedPosts = JSON.parse(localStorage.getItem("timeline-posts")) || [];
    savedPosts.forEach(postData => {
      const post = this.createPostFromData(postData);
      if (post) {
        this.addPost(post, false); // Не сохранять в localStorage при загрузке
      }
    });
  }
  addPost(post, saveToStorage = true) {
    this.posts.push(post);
    this.renderPost(post);
    if (saveToStorage) {
      this.saveToLocalStorage();
    }
  }
  renderPost(post) {
    const postElement = post.render();
    this.container.prepend(postElement);
  }
  saveToLocalStorage() {
    const postData = this.posts.map(post => post.toJSON());
    localStorage.setItem("timeline-posts", JSON.stringify(postData));
  }
  createPostFromData(data) {
    switch (data.type) {
      case "text":
        return new TextPost(data.content, data.coordinates, this.posts);
      case "audio":
        return new AudioPost(data.content, data.coordinates, this.posts);
      case "video":
        return new VideoPost(data.content, data.coordinates, this.posts);
      default:
        return null;
    }
  }
}
;// ./src/js/app.js




document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
});
class App {
  constructor() {
    this.timeline = new Timeline();
  }
  init() {
    this.timeline.init(document.body);

    // Обработка ввода текста
    const inputField = document.querySelector(".input-field");
    inputField.addEventListener("keypress", event => {
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
    post.getCoordinates().then(() => {
      this.timeline.addPost(post);
    }).catch(error => {
      console.error("Ошибка при получении координат:", error.message);
      alert("Не удалось получить координаты. Попробуйте снова.");
    });
  }
  createAudioPost() {
    const post = new AudioPost("", [], this.timeline.posts);
    post.startRecording().then(() => {
      return post.getCoordinates();
    }).then(() => {
      this.timeline.addPost(post);
    }).catch(error => {
      console.error("Ошибка при создании аудио-записи:", error.message);
      alert("Не удалось создать аудио-запись. Попробуйте снова.");
    });
  }
  createVideoPost() {
    const post = new VideoPost("", [], this.timeline.posts);
    post.startRecording().then(() => {
      return post.getCoordinates();
    }).then(() => {
      this.timeline.addPost(post);
    }).catch(error => {
      console.error("Ошибка при создании видео-записи:", error.message);
      alert("Не удалось создать видео-запись. Попробуйте снова.");
    });
  }
}
;// ./src/index.js



// TODO: write your code in app.js
/******/ })()
;