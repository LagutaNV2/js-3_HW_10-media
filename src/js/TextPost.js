// Класс для текстовых записей
import Post from "./Post.js";

export default class TextPost extends Post {
  constructor(content, coordinates, posts) {
    super("text", content, coordinates, posts);
  }
}
