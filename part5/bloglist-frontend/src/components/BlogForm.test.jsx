import { render, screen } from "@testing-library/react";
import BlogForm from "./BlogForm";
import userEvent from "@testing-library/user-event";

test("<BlogForm /> updates parent state and calls onSubmit", async () => {
  const handleNewBlog = vi.fn();
  const user = userEvent.setup();
  render(<BlogForm handleNewBlog={handleNewBlog} />);

  const titleInput = screen.getByLabelText("title:");
  const authorInput = screen.getByLabelText("author:");
  const urlInput = screen.getByLabelText("url:");
  const sendButton = screen.getByText("create");

  await user.type(titleInput, "Testing Blog Title");
  await user.type(authorInput, "Test Author");
  await user.type(urlInput, "http://test.com");
  await user.click(sendButton);

  expect(handleNewBlog.mock.calls).toHaveLength(1);
  expect(handleNewBlog.mock.calls[0][0].title).toBe("Testing Blog Title");
  expect(handleNewBlog.mock.calls[0][0].author).toBe("Test Author");
  expect(handleNewBlog.mock.calls[0][0].url).toBe("http://test.com");
});
