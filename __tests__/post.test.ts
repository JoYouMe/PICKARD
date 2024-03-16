import PostService from '../server/services/postService';
import Post from '../server/controllers/post';
import { Database } from '../server/database/config'

describe('PostService', () => {
  let postService;
  let db;

  beforeEach(() => {
    db = Database.getInstance();
    postService = new PostService();
  });

  test('PostService.updatePost', async () => {
    const postId = '1';
    const updatePost = { userId: '1', title: 'Updated Title', content: 'Updated Content' }
    const post = await postService.updatePost(updatePost, postId);

    expect(post).toBeDefined();
    expect(post.userId).toBe('1');
    expect(post.title).toBe('Updated Title');
    expect(post.content).toBe('Updated Content');
  });

  test('PostService.deletePost', async () => {
    const postId = '1';
    const userId = '1';
    const result = await postService.deletePost(userId, postId);

    expect(result).toBe(true);
  });
});

describe('Post', () => {
  let post;
  let db;

  beforeEach(() => {
    db = Database.getInstance();
    post = new Post();
  });

  test('Post.updatePost', async () => {
    const ctx = {
      params: {
        postId: '1'
      },
      request: {
        body: { userId: '1', title: 'Updated Title', content: 'Updated Content' }
      }
    };

    await post.updatePost(ctx);
    expect(ctx.request.body.userId).toBe('1');
    expect(ctx.request.body.title).toBe('Updated Title');
    expect(ctx.request.body.content).toBe('Updated Content');
  });

  test('Post.deletePost', async () => {
    const ctx = {
      params: {
        postId: '1'
      },
      request: {
        body: '1'
      }
    };

    await post.deletePost(ctx);

    expect(ctx.request.body).toBe(true);
  });
});
