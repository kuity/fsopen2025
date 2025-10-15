const populateBlogs = async (page) => {
  // Create first blog
  await page.getByRole("button", { name: "Create Blog" }).click();
  await page.getByRole("textbox", { name: "title:" }).fill("First Blog");
  await page.getByRole("textbox", { name: "author:" }).fill("Author One");
  await page.getByRole("textbox", { name: "url:" }).fill("http://example1.com");
  await page.getByRole("button", { name: "create" }).click();
  await page.getByText("First Blog - Author One").waitFor();

  // Create second blog
  await page.getByRole("textbox", { name: "title:" }).fill("Second Blog");
  await page.getByRole("textbox", { name: "author:" }).fill("Author Two");
  await page.getByRole("textbox", { name: "url:" }).fill("http://example2.com");
  await page.getByRole("button", { name: "create" }).click();
  await page.getByText("Second Blog - Author Two").waitFor();
};

export { populateBlogs };
