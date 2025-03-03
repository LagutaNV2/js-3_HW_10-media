/**
 * @jest-environment jsdom
 */

import Post from "./Post.js";

describe("parseCoordinates", () => {
  let post;
  let alertMock;

  beforeEach(() => {
    // Создаем экземпляр Post и мокаем alert
    post = new Post("test", "", [], []);
    alertMock = jest.fn();
    window.alert = alertMock;

    // Очищаем DOM перед каждым тестом
    document.body.innerHTML = "";
  });

  test("should correctly parse coordinates with spaces", () => {
    const input = "51.50851, −0.12572";
    const result = post.parseCoordinates(input);
    expect(result).toEqual([51.50851, -0.12572]);
  });

  test("should correctly parse coordinates without spaces", () => {
    const input = "51.50851,−0.12572";
    const result = post.parseCoordinates(input);
    expect(result).toEqual([51.50851, -0.12572]);
  });

  test("should correctly parse coordinates with brackets", () => {
    const input = "[51.50851, −0.12572]";
    const result = post.parseCoordinates(input);
    expect(result).toEqual([51.50851, -0.12572]);
  });
  test("should show alert for invalid coordinates input", async () => {
    // 1. Мокаем alert
    window.alert = jest.fn();

    // 2. Запускаем модальное окно и получаем Promise
    const modalPromise = post.showManualCoordinatesModal();

    // 3. Получаем элементы модалки
    const input = document.querySelector("input");
    const okBtn = document.querySelector(".ok-btn");

    // 4. Симулируем ввод невалидных данных и клик
    input.value = "invalid_data";
    okBtn.click();

    // 5. Ожидаем завершения Promise с обработкой таймаута
    await Promise.race([
      modalPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Test timeout")), 2000),
      ),
    ]).catch(() => {});

    // 6. Проверяем вызов alert
    expect(window.alert).toHaveBeenCalledWith(
      "Неверный формат координат. Используйте: 'широта, долгота'",
    );
  }, 10000); // Увеличиваем таймаут теста до 10 секунд
});
