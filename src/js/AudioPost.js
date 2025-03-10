// Класс для аудио-записей AudioPost.js
import Post from "./Post.js";

export default class AudioPost extends Post {
  constructor(content, coordinates, posts, timestamp = null) {
    super("audio", content, coordinates, posts, timestamp);
    this.mediaBlob = null;
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      // Возвращаем промис, который ждет остановки записи
      await new Promise((resolve, reject) => {
        mediaRecorder.onstop = async () => {
          try {
            this.mediaBlob = new Blob(chunks, { type: "audio/webm" });
            this.content = await this.blobToBase64(this.mediaBlob);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 5000);
      });
    } catch (error) {
      console.error("Ошибка записи аудио:", error);
      throw error;
    }
  }

  renderContent() {
    const src = `data:audio/webm;base64,${this.content}`; // Создаем URL из Base64
    return `<audio controls src="${src}"></audio>`;
  }
}
