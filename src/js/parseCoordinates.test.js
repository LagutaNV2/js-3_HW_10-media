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
    window.alert = jest.fn();

    const modalPromise = post.showManualCoordinatesModal();

    const input = document.querySelector("input");
    const okBtn = document.querySelector(".ok-btn");

    // Симулируем ввод невалидных данных и клик
    input.value = "invalid_data";
    okBtn.click();

    // Ожидаем завершения Promise с обработкой таймаута
    await Promise.race([
      modalPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Test timeout")), 2000),
      ),
    ]).catch(() => {});

    // Проверяем вызов alert
    expect(window.alert).toHaveBeenCalledWith(
      "Неверный формат координат. Используйте: 'широта, долгота'",
    );
  }, 10000);
});
