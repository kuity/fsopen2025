import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Blog from "./Blog";

describe("<Blog />", () => {
  let mockHandleLike;
  let mockHandleDelete;

  beforeEach(() => {
    const blog = {
      title: "ABCDE",
      author: "Test Author",
      url: "http://test.com",
      likes: 5,
      user: {
        username: "testuser",
        name: "Test User",
        id: "123",
      },
    };

    const mockUser = {
      username: "testuser",
      name: "Test User",
    };

    mockHandleLike = vi.fn();
    mockHandleDelete = vi.fn();

    render(
      <Blog
        blog={blog}
        handleLike={mockHandleLike}
        handleDelete={mockHandleDelete}
        user={mockUser}
      />
    );
  });

  test("renders content", async () => {
    const element = await screen.findByText("ABCDE", { exact: false });
    const url = screen.queryByText("http://test.com");
    expect(url).not.toBeInTheDocument();
    const likes = screen.queryByText("likes:");
    expect(likes).not.toBeInTheDocument();
  });

  test("view toggle works", async () => {
    const user = userEvent.setup();
    const showButton = await screen.findByText("view");
    await user.click(showButton);
    await screen.findByText("http://test.com");
    await screen.findByText("likes:", { exact: false });
  });

  test("click works", async () => {
    const user = userEvent.setup();
    const showButton = await screen.findByText("view");
    await user.click(showButton);
    const button = await screen.findByText("like");
    await user.click(button);
    expect(mockHandleLike.mock.calls).toHaveLength(1);
    await user.click(button);
    expect(mockHandleLike.mock.calls).toHaveLength(2);
  });
});
