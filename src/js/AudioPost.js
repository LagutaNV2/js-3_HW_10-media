// Класс для аудио-записей
import Post from "./Post.js";

export default class AudioPost extends Post {
  constructor(content, coordinates, posts) {
    super("audio", content, coordinates, posts);
    this.mediaBlob = null;
  }

  async startRecording() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          const chunks = [];

          mediaRecorder.ondataavailable = (event) => {
            chunks.push(event.data);
          };

          mediaRecorder.onstop = async () => {
            this.mediaBlob = new Blob(chunks, { type: "audio/webm" });
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
    const src = `data:audio/webm;base64,${this.content}`; // Создаем URL из Base64
    return `<audio controls src="${src}"></audio>`;
  }
}
