import {wrap} from "svelte-spa-router/wrap"
import Login from "../components/Login.svelte"
import Posts from "../components/Posts.svelte"
import Mypage from "../components/Mypage.svelte"
import DetailPost from "../components/DetailPost.svelte"
import CreatePost from "../components/createPost.svelte"

const routes = {
	"/": Login,
	"/posts": Posts,
	"/createPost": CreatePost,
	"/detail/:id": DetailPost,
	"/mypage": Mypage,
}

export default routes