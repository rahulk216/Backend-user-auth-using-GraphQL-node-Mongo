const Post = require('../../models/Post');
const checkAuth = require('../../utils/checkAuth');
const { AuthenticationError, UserInputError } = require('apollo-server');

module.exports = {
	Query: {
		async getPosts() {
			try {
				const posts = await Post.find().sort({ createdAt: -1 });
				return posts;
			} catch (err) {
				throw new Error(err);
			}
		},
		async getPost(_, { postId }) {
			console.log(postId);
			try {
				const post = await Post.findById(postId);
				console.log(post);
				if (post) {
					return post;
				} else {
					throw new Error('Post not found');
				}
			} catch (err) {
				throw new Error(err);
			}
		},
	},
	Mutation: {
		async createPost(_, { body }, context) {
			const user = checkAuth(context);
			const newPost = new Post({
				body,
				user: user.id,
				username: user.username,
				createdAt: new Date().toISOString(),
			});
			const post = await newPost.save();
			return post;
		},
		async deletePost(_, { postId }, context) {
			const user = checkAuth(context);
			try {
				const post = await Post.findById(postId);
				if (user.username == post.username) {
					await post.delete();
					return 'Post deleted succesfully';
				} else {
					throw new Error('user not defined');
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		async createComment(_, { postId, body }, context) {
			const { username } = checkAuth(context);
			if (body.trim() === '') {
				throw new UserInputError('Empty comment', {
					errors: {
						body: 'Comment body must not empty',
					},
				});
			}
			const post = await Post.findById(postId);
			if (post) {
				post.comments.unshift({
					body,
					username,
					createdAt: new Date().toISOString(),
				});
				await post.save();
				return post;
			} else throw new UserInputError('Post not found');
		},
		async deleteComment(_, { postId, commentId }, context) {
			const { username } = checkAuth(context);
			const post = await Post.findById(postId);
			if (post) {
				const commentIndex = post.comments.findIndex(
					(c) => c.id === commentId
				);
				if (post.comments[commentIndex].username === username) {
					post.comments.splice(commentIndex, 1);
					await post.save();
					return post;
				} else {
					throw new AuthenticationError('Action not allowed');
				}
			}else{
				throw new UserInputError('Post not found');
			}
		},
		async likePost(_,{ postId }, context){
			const { username } = checkAuth(context);
			const post = await Post.findById(postId);
			if(post){
				if(post.likes.find(like=>like.username)){
					//post already liked
					post.likes = post.likes.filter(like=>like.username!==username);
					await post.save();
				}
				else{
					post.likes.push({
						username,
						createdAt: new Date.toISOString()
					})
					await post.save();
					return post;
				}
			}
			else
			{
				throw new UserInputError('post not found')
			}
		}
	},
};
