// Класс для видео-записей
import Post from "./Post.js";

export default class VideoPost extends Post {
  constructor(content, coordinates, posts) {
    super("video", content, coordinates, posts);
    this.mediaBlob = null;
  }

  async startRecording() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          const chunks = [];

          mediaRecorder.ondataavailable = (event) => {
            chunks.push(event.data);
          };

          mediaRecorder.onstop = async () => {
            this.mediaBlob = new Blob(chunks, { type: "video/webm" });
            // this.content = URL.createObjectURL(this.mediaBlob);
            this.content = await this.blobToBase64(this.mediaBlob); // Используем метод из базового класса
            resolve();
          };

          mediaRecorder.start();
          setTimeout(() => mediaRecorder.stop(), 5000); // Запись 5 секунд
        })
        .catch(reject);
    });
  }

  renderContent() {
    const src = `data:video/webm;base64,${this.content}`; // Создаем URL из Base64
    return `<video controls src="${src}"></video>`;
  }
}
