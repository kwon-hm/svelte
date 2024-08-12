<Header />
{#if userId}
  <div class="detail-main">
    <div class="detail-box">
      <Textfield
        autocomplete="off"
        bind:value={title}
        label="제목"
        message="Post 제목"
        bind:this={inputTitle}
      />
      <div class="detail-ul">
        <ul >
          <li style="padding-right: 21%">createDate: {createDate}</li>
          <li>modifiedDate: {modifiedDate}</li>
        </ul>
      </div>
      <div>
        <textarea 
          bind:value={contents} 
          bind:this={inputContents} 
          cols="118%" 
          rows="5"
          style="resize: none;"
        ></textarea><br>
      </div>
      {#if userId === $uId}
        <Button raised color="#ff3e00" title="Simple button" on:click={editPost}>수정</Button>
        <Button raised title="Simple button" on:click={deletePost}>삭제</Button>
        <Button raised title="Simple button" on:click={cancel}>취소</Button>
      {/if}
    </div>
    
    <div class="coment-border">
      <br>
    </div>
    <div class="coment">
      <p class="coment-p">댓글:</p>
      <div class="coment-main">
        <textarea 
          class="coment-area" 
          name="" id="coment-area" 
          rows="2"
          bind:value={comentVal}
          bind:this={comentInput}
        ></textarea>
        <Button 
          raised 
          color="#ff3e00" 
          title="Simple button" 
          style="float: right; margin-top: 13px" 
          on:click={saveComent}
        >저장</Button>
      </div>
      {#if coments.length > 0}
        {#each coments as coment}
          <div class="coment-ul" id="coment-ul-{coment.no}">
              <div style="text-align: left;">작성자: {coment.writer}</div>
              <div style="text-align: left;">작성일자: {coment.createdDate}</div>
              <div style="text-align: left;">댓글: {coment.coment}</div>
            {#if coment.userId === $uId}
              <div style="text-align: left;">
                <Button 
                  raised 
                  color="#ff3e00" 
                  title="Simple button" 
                  style="float: none; margin-top: 13px" 
                  on:click={saveComent}
                >수정</Button>
                <Button 
                  raised 
                  title="Simple button" 
                  style="float: none; margin-top: 13px" 
                  on:click={deleteComent(coment.no)}
                >삭제</Button>
              </div>
            {/if}
            <br><br>
          </div>
        {/each}
      {/if}
    </div>
  </div>
{/if}
<script>
import { push } from "svelte-spa-router"
import Header from "./Header.svelte"
import api from "../api/axios"
import { Snackbar,Textfield, Button } from 'svelte-mui'
import {uId, uName} from "../store/store"
export let params = {}

let userId, writer, title, 
    contents, category, createDate, 
    modifiedDate, inputTitle, inputContents, 
    comentVal, comentInput, coments


let fn_detail = async ()=>{
  let res = await api.detailPost(params.id)
  title = res.post.title
  writer = res.post.writer
  userId = res.post.userId
  contents = res.post.contents
  category = res.post.category
  createDate = res.post.createdDate
  modifiedDate = res.post.modifiedDate
  coments = res.coments
} 

fn_detail()

const editPost = async ()=>{
  if(title === ""){
    alert("Title is null")
    inputTitle.focus()
    return
  }
  if(contents === ""){
    alert("Contents is null")
    inputContents.focus()
    return
  }
  const result = await api.updatePost(params.id, title, contents, $uId)
  if(result === 1){
    alert("Edit post success.")
    push("/posts")
  }
}

const cancel = ()=>{
  push("/posts")
}

const saveComent = async ()=>{
  if(comentVal === ""){
    alert("Coment is null")
    comentInput.focus()
    return
  }
  if(comentVal === undefined){
    alert("Coment is null")
    comentInput.focus()
    return
  }
  const result = await api.saveComent(params.id, comentVal, $uId, $uName)
  if(result === 1){
    alert("Save coment success.")
    comentVal = ""
    fn_detail()
  }
}

const deletePost = async ()=>{
  const con = confirm("Delete?")
  if(!con) return
  else{
    const result = await api.deletePost(params.id)
    if(result === 1){
      alert("Deleted")
      push("/posts")
    }
  }
}

const deleteComent = async (no)=>{
  let res = await api.deleteComent(no)
  if(res === 1){
    alert("Delete coment success.")
    fn_detail()
  }
}

</script>