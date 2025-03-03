// Базовый класс для всех типов записей
export default class Post {
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
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.coordinates = [
              position.coords.latitude,
              position.coords.longitude,
            ];
            resolve();
          },
          async () => {
            try {
              const coords = await this.showManualCoordinatesModal();
              this.coordinates = coords;
              resolve();
            } catch (error) {
              console.warn("Ручной ввод координат отменен");
              // Не вызываем reject(), чтобы избежать Uncaught (in promise)
              resolve(); // Просто завершаем промис без ошибки
            }
          },
        );
      });
    } else {
      try {
        const coords = await this.showManualCoordinatesModal();
        this.coordinates = coords;
      } catch (error) {
        console.warn("Ручной ввод координат отменен");
        // Не вызываем reject(), чтобы избежать Uncaught (in promise)
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

    input = input
      .trim()
      .replace(/[[]/g, "")
      .replace(/\u2212/g, "-");

    // Разбиваем строку по запятой
    const parts = input.split(/\s*,\s*/);
    if (parts.length !== 2) {
      throw new Error("Invalid coordinates format");
    }

    // Преобразуем в числа
    const latitude = parseFloat(parts[0]);
    const longitude = parseFloat(parts[1]);

    // Проверяем, являются ли они числами
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
      timestamp: this.timestamp.toISOString(),
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
      postElement.remove(); // Удаляем элемент из DOM
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
      minute: "2-digit",
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
    const postData = this.posts.map((post) => post.toJSON());
    localStorage.setItem("timeline-posts", JSON.stringify(postData));
  }
}
