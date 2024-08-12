<Header />
<div class="mypage">
  <Textfield
    label="No"
    message="User No"
    readonly
    placeholder="{no}"
  />
  <Textfield
    label="Company"
    message="User company"
    readonly
    placeholder="{company}"
  />
  <Textfield
    bind:value={name}
    label="Name"
    message="User name"
  />
  <Textfield
    bind:value={email}
    label="Email"
    message="User email"
  />
  <Textfield
    bind:value={password}
    label="Password"
    message="User password"
    bind:this={inpuPW}
  />
  <Textfield
    bind:value={phone}
    label="Phone"
    message="Phone number"
  />
  <Button raised color="#ff3e00" on:click={save}>저장</Button>&nbsp;&nbsp;
  <Button raised on:click={cancel}>취소</Button>
</div>

{#if snackbar_message == "My info update success."}
  <Snackbar bind:visible  timeout="3" bg="#ff3e00">
    {snackbar_message}
    <span slot="action">
        <Button color="#ff0" on:click={()=>{visible = false}}>Close</Button>
    </span>
  </Snackbar>
{:else}
  <Snackbar bind:visible  timeout="3" >
    {snackbar_message}
    <span slot="action">
        <Button color="#ff0" on:click={()=>{visible = false}}>Close</Button>
    </span>
  </Snackbar>
{/if}

<script>
  import Header from "./Header.svelte"
  import {tk, uId} from "../store/store"
  import api from "../api/axios"
  import {onMount} from "svelte"
  import { Snackbar,Textfield, Button } from 'svelte-mui';
  import {push} from "svelte-spa-router"

  let no, name, email, password, company, phone, snackbar_message, inpuPW
  let visible = false

  onMount(async () => {
    const res = await api.getDecodeUser($tk)
    no = res.no
    name = res.userName
    email = res.userEmail
    company = res.company
    phone = res.userMobile
  })

  const save = async () => {
    const res = await api.updateUser(no, name, email, $uId, phone, password)
    if(res === 1){
      snackbar_message = "My info update success."
    }else{
      snackbar_message = "Error."
    }
    visible = true
  }

  const cancel = () => {
    push("/posts")
  }

</script>

<style>
  div{
    text-align: center
  }
</style>