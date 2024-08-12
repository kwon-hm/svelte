<Header />
<div class="post-main">

  <div>
  </div>
  <DataTable table$aria-label="Products" class="post-table">
    <Head class="post-Head">
      <Row style="bo">
        <Cell style="width: 10%;">No</Cell>
        <Cell>Title</Cell>
        <Cell style="width: 20%;">Writer</Cell>
        <Cell style="width: 20%;">CreatedDate</Cell>
      </Row>
    </Head>
    <Body>
      {#if posts.length === 0}
        <Row colspan="4">
          <Cell>No post.</Cell>
        </Row>
      {:else}
        {#each posts as post}
          <Row on:click={detail(post.no)}>
            <Cell>{post.num}</Cell>
            <Cell>{post.title}</Cell>
            <Cell>{post.writer}</Cell>
            <Cell>{post.createdDate}</Cell>
          </Row>
        {/each}
      {/if}
    </Body>
  </DataTable>
  <div style="text-align: right; margin: 0px; width: 100%; padding-top: 10px;">
    <Button 
      raised 
      color="#ff3e00" 
      title="Simple button"  
      on:click={createPost}
    >글 쓰기</Button>
    <input 
      type="text" 
      style="float: left;"
      bind:value={$search} 
    />
    <Button 
      raised 
      color="#ff3e00" 
      title="Simple button"  
      on:click={go_search} 
      style="float: left;"
    >Search</Button>
  </div>
  <div class="post_paging">
    <br>
    <Pagination 
      totalRecords={totalCount} 
      bind:offset={$offset}
      bind:pageSize={$pageSize}
      on:pageChange={go_page}
    />
  </div>
</div>

<script>
import api from "../api/axios"
import {cp, offset, search, pageSize} from "../store/store"
import Header from "./Header.svelte"
import {push} from "svelte-spa-router"
import { Button } from 'svelte-mui'
import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';
import {onMount} from "svelte"
import Pagination from "svelte-atoms/Pagination.svelte";

let posts = []
let totalCount

onMount(async ()=>{
  if($cp !== ""){
    const res = await api.getPost($cp, $offset, $search, $pageSize)
    posts = res.post
    totalCount = res.paging.totalCount
  }
})

const createPost = () =>{
  push("/createPost")
}

const detail = (no) => {
  push("/detail/" + no)
}

const go_page = async () => {
  const res = await api.getPost($cp, $offset, $search, $pageSize)
  posts = res.post
  totalCount = res.paging.totalCount
  if($offset > totalCount){
    $offset = 0
  }
}

const go_search = async () => {
  const res = await api.getPost($cp, 0, $search, $pageSize)
  posts = res.post
  totalCount = res.paging.totalCount
  if($offset > totalCount){
    $offset = 0
  }
}
</script>

<style>
  div {
    width: 80%;
    margin: auto;
    text-align: center;
  }
</style>