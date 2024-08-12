<Header />
<div class="create-main">
  <div class="create-box">
    <Textfield
    autocomplete="off"
    bind:value={title}
    label="제목"
    message="Post 제목"
    />
    <textarea bind:value={contents} cols="100%" rows="5" placeholder="내용"></textarea><br>
    <Button raised color="#ff3e00" on:click={save}>저장</Button>&nbsp;&nbsp;
    <Button raised on:click={cancel}>취소</Button>
  </div>
</div>

<Snackbar bind:visible  timeout="3" >
	{snackbar_message}
	<span slot="action">
			<Button color="#ff0" on:click={()=>{visible = false}}>Close</Button>
	</span>
</Snackbar>

<script>
import { push } from "svelte-spa-router";
import api from "../api/axios"
import Header from "./Header.svelte"
import {cp, uName, uNo, uId} from "../store/store"
import { Snackbar,Textfield, Button } from 'svelte-mui';

let title, contents, visible, snackbar_message

const save = async () =>{
  if(title === "" || title === undefined || contents === "" || contents === undefined){
    snackbar_message = "Title or Contents is null"
	  visible = true
		return
	}
  console.log(title, contents, $uId, $uName, $cp)
  const res = await api.savePost(title, contents, $uId, $uName, $cp)
  if(res === 1){
    alert("Create post success.")
  }else{
    alert("Save error.")
  }
  push("/posts")
}

const cancel = () =>{
  push("/posts")
}
</script>

<style>

</style>

