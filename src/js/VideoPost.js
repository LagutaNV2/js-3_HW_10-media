// Класс для видео-записей
import Post from "./Post.js";

export default class VideoPost extends Post {
  constructor(content, coordinates, posts, timestamp = null) {
    super("video", content, coordinates, posts, timestamp);
    this.mediaBlob = null;
    this.isRecording = false;
  }

  async startRecording() {
    if (!MediaRecorder.isTypeSupported("video/webm")) {
      throw new Error("Формат video/webm не поддерживается браузером");
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Браузер не поддерживает доступ к медиаустройствам");
    }

    if (this.isRecording) throw new Error("Запись уже идет");
    this.isRecording = true;

    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        // video: { facingMode: "user" }, // Используем фронтальную камеру
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      await new Promise((resolve, reject) => {
        mediaRecorder.onstop = async () => {
          try {
            this.mediaBlob = new Blob(chunks, { type: "video/webm" });
            this.content = await this.blobToBase64(this.mediaBlob);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        mediaRecorder.onerror = (error) => reject(error);
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 5000);
      });
    } catch (error) {
      console.error("Ошибка записи видео:", error);
      throw error;
    } finally {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop(); // Освобождаем ресурсы
          track.enabled = false;
        });
      }
      this.isRecording = false;
      stream = null;
    }
  }

  renderContent() {
    const src = `data:video/webm;base64,${this.content}`; // Создаем URL из Base64
    return `<video controls src="${src}"></video>`;
  }
}
