export interface CreatePost {
    userId: number;
    password: string;
    title: string;
    content: string;
}

export interface UpdatePost {
    userId: number;
    title: string;
    content: string;
}

export interface CreateReply {
    userId: number;
    postId: string;
    content: string;
}
