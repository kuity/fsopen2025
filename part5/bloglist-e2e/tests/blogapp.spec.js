import { test, expect, beforeEach, describe } from "@playwright/test";
import { populateBlogs } from "./helper.js";

test.describe.configure({ mode: "serial" });

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("/api/testing/reset");
    await request.post("/api/users", {
      data: {
        name: "Test User",
        username: "testuser",
        password: "12345",
      },
    });
    await page.goto("/");
  });

  test("Login form is shown", async ({ page }) => {
    await expect(page.getByLabel("username")).toBeVisible;
    await expect(page.getByLabel("password")).toBeVisible;
    await expect(page.getByRole("button")).toContainText("login");
  });

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await page.getByLabel("username").fill("testuser");
      await page.getByLabel("password").fill("12345");
      await page.getByRole("button", { name: "login" }).click();

      await expect(page.getByText("Test User logged in")).toBeVisible();
      await expect(page.getByRole("button", { name: "log out" })).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      await page.getByLabel("username").fill("testuser");
      await page.getByLabel("password").fill("wrong");
      await page.getByRole("button", { name: "login" }).click();

      await expect(page.getByText("wrong credentials")).toBeVisible();
    });
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      await page.getByLabel("username").fill("testuser");
      await page.getByLabel("password").fill("12345");
      await page.getByRole("button", { name: "login" }).click();
    });

    test("a new blog can be created", async ({ page }) => {
      await page.getByRole("button", { name: "Create Blog" }).click();
      await page
        .getByRole("textbox", { name: "title:" })
        .fill("Playwright blog");
      await page.getByRole("textbox", { name: "author:" }).fill("playwright");
      await page
        .getByRole("textbox", { name: "url:" })
        .fill("http://localhost.com");
      await page.getByRole("button", { name: "create" }).click();

      await expect(
        page.getByText("Playwright blog - playwright")
      ).toBeVisible();
    });

    test("a blog can be liked", async ({ page }) => {
      await populateBlogs(page);
      await expect(page.getByText("First Blog - Author One")).toBeVisible();
      await page.getByRole("button", { name: "view" }).first().click();
      await expect(page.getByText("likes: 0")).toBeVisible();
      await page.getByRole("button", { name: "like" }).click();
      await expect(page.getByText("likes: 1")).toBeVisible();
    });

    test("a blog can be deleted by the creator", async ({ page }) => {
      page.on("dialog", (dialog) => dialog.accept());
      await populateBlogs(page);
      await expect(page.getByText("First Blog - Author One")).toBeVisible();
      await page.getByRole("button", { name: "view" }).first().click();
      await page.getByRole("button", { name: "remove" }).click();
      await expect(page.getByText("First Blog - Author One")).not.toBeVisible();
    });

    test("a blog cannot be deleted by a different user", async ({
      page,
      request,
    }) => {
      await populateBlogs(page);
      await page.getByRole("button", { name: "log out" }).click();
      await request.post("/api/users", {
        data: {
          name: "Another User",
          username: "anotheruser",
          password: "12345",
        },
      });
      await page.getByLabel("username").fill("anotheruser");
      await page.getByLabel("password").fill("12345");
      await page.getByRole("button", { name: "login" }).click();
      await expect(page.getByText("Another User logged in")).toBeVisible();
      await expect(page.getByText("First Blog - Author One")).toBeVisible();
      await page.getByRole("button", { name: "view" }).first().click();
      await expect(
        page.getByRole("button", { name: "remove" })
      ).not.toBeVisible();
    });

    test("blogs are arranged by number of likes", async ({ page }) => {
      await populateBlogs(page);
      await page.getByRole("button", { name: "view" }).nth(1).click();
      await page.getByRole("button", { name: "like" }).click();
      const blogs = page.locator(".blogpost");
      await expect(blogs.nth(0)).toContainText("Second Blog");
      await expect(blogs.nth(1)).toContainText("First Blog");
    });
  });
});
