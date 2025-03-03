// Класс для управления Timeline
import TextPost from "./TextPost.js";
import AudioPost from "./AudioPost.js";
import VideoPost from "./VideoPost.js";

export default class Timeline {
  constructor() {
    this.posts = [];
    this.container = null;
  }

  init(container) {
    this.container = container;

    // Загрузка записей из localStorage
    const savedPosts = JSON.parse(localStorage.getItem("timeline-posts")) || [];
    savedPosts.forEach((postData) => {
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
    const postData = this.posts.map((post) => post.toJSON());
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
