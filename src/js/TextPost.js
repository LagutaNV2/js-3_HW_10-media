// Класс для текстовых записей TextPost.js
import Post from "./Post.js";

export default class TextPost extends Post {
  constructor(content, coordinates, posts, timestamp = null) {
    super("text", content, coordinates, posts, timestamp);
  }
}
