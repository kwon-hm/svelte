<div class="main">
	<div class="box">
		<div>
			<img class="logo" {src} alt="logo">
		</div><br>
		<input 
			type="text"	
			placeholder="User ID"	
			bind:value={id} 
			bind:this={idInput}
		/>
		<br>
		<input 
			type="password" 
			placeholder="Password"	
			bind:value={pw} 
			on:keydown={(e) => {e.key === "Enter" && login()}}
		/>
		<br>
		<Button raised color="#ff3e00" title="Simple button" on:click={login}>Login</Button>
		<Button	raised on:click={reset}>초기화</Button>
	</div>
</div>
<Snackbar bind:visible  timeout="3">
	{snackbar_message}
	<span slot="action">
			<Button color="#ff0" on:click={()=>{visible = false}}>Close</Button>
	</span>
</Snackbar>

<script>
import api from "../api/axios"
import {push} from 'svelte-spa-router'
import {tk, cp, uName, uNo, uId} from "../store/store"
import {onMount} from "svelte"
import 'focus-visible';
import { Snackbar, Button } from 'svelte-mui';

let id,pw,idInput,snackbar_message = ""
let src = "/img/svelte-logo.png"
let visible = false;

const login = async () => {
	if(id === "" || id === undefined || pw === "" || pw === undefined){
		show_snackbar("ID or PW is null")
		return
	}
	const res = await api.login(id, pw);
	if(res === null){
		show_snackbar("Data is null")
		reset()
		idInput.focus()
		return
	}
	$tk = res.token
	$uNo = res.user.no
	$uId = res.user.userId
	$uName = res.user.userName
	$cp = res.user.company
	push("/posts")
}

const reset = () => {
	id = ""
	pw = ""
	idInput.focus()
}

onMount(() => {
	idInput.focus()
})

const show_snackbar = (msg) => {
	snackbar_message = msg
	visible = true
	idInput.focus()
}
</script>
	
<style>
.main{
	width: 100%;
	height: 100%;
}
.box{
	width: 50%;
	margin: auto;
	text-align: center;
}
.logo{
	width: 30%;
	height: 30%;
}
</style>