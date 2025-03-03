// Класс для аудио-записей
import Post from "./Post.js";

export default class AudioPost extends Post {
  constructor(content, coordinates, posts) {
    super("audio", content, coordinates, posts);
    this.mediaBlob = null;
  }

  async startRecording(type) {
    // Проверка поддержки API getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("API getUserMedia не поддерживается в вашем браузере.");
      alert("Ваш браузер не поддерживает запись аудио/видео. Попробуйте использовать другой браузер.");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        type === "audio" ? { audio: true } : { video: true, audio: true }
      );

      // Скрываем кнопки микрофона и камеры
      this.hideMediaButtons();

      // Инициализируем запись
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      let seconds = 0;
      this.timerInterval = setInterval(() => {
        seconds++;
        this.updateTimer(seconds);
      }, 1000);

      mediaRecorder.ondataavailable = (event) => chunks.push(event.data);

      mediaRecorder.onstop = async () => {
        clearInterval(this.timerInterval);
        this.showMediaButtons(); // Показываем кнопки после завершения записи

        const blob = new Blob(chunks, { type: type === "audio" ? "audio/webm" : "video/webm" });
        this.content = await this.blobToBase64(blob);

        if (type === "video") {
          this.stopVideoPreview(stream); // Останавливаем предпросмотр видео
        }

        this.getCoordinates().then(() => {
          this.timeline.addPost(this);
        });
      };

      mediaRecorder.start();
      this.mediaRecorder = mediaRecorder; // Сохраняем ссылку на mediaRecorder
    } catch (error) {
      console.error("Ошибка при получении доступа к медиаустройствам:", error.message);
      alert(
        "Не удалось получить доступ к микрофону/камере. Проверьте настройки браузера или используйте другой браузер."
      );
    }
  }

  renderContent() {
  if (this.type === "audio") {
    return `<audio controls src="data:audio/webm;base64,${this.content}"></audio>`;
  } else if (this.type === "video") {
    return `<video controls src="data:video/webm;base64,${this.content}"></video>`;
  }
  return `<p>${this.content}</p>`;
}
}
