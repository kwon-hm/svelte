<div class="header">
  <div class="h1">
    <h1>{$cp === null ? "" : $cp}</h1>
  </div>
  <div class="canvas">
    <canvas
      bind:this={canvas}
      width={32}
      height={32}
      on:click={()=>{push("/posts")}}
    />
  </div>
  <div class="ul-li">
    <ul class="ul">
      <li>
        <Button
          unelevated
          color="#ff3e00"
          active={justify.justify}
          on:change={(e) => {
              onjustify('justify', e.detail);
          }}
          on:click={()=>{rightVisible = true}}
        >
        <i class="asdf">
          <svg class="asdf">
            <path class="asdf" d="M 3 21 h 18 v -2 H 3 v 2 Z m 0 -4 h 18 v -2 H 3 v 2 Z m 0 -4 h 18 v -2 H 3 v 2 Z m 0 -4 h 18 V 7 H 3 v 2 Z m 0 -6 v 2 h 18 V 3 H 3 Z" />
          </svg>
        </i>
        </Button>
      </li>
    </ul>
  </div>
</div>

<Sidepanel right bind:visible={rightVisible}>
  <div class="rightVisible">Menu</div>
  <div>
    <ul class="right_ul">
      <li on:click={push_to}>Home</li>
      <li on:click={()=>{push("/mypage")}}>MYPAGE</li>
    </ul>
    <ul class="right_ul" style="position: absolute; bottom: 0;">
      <li on:click={logout}>LOGOUT</li>
    </ul>
  </div>
</Sidepanel>

<script>
import {push} from "svelte-spa-router"
import {tk, cp, uName, uNo} from "../store/store"
import {onMount} from "svelte"
import { Sidepanel,Button} from 'svelte-mui';
import api from "../api/axios"

let canvas
let justify = {justify: false}
export let rightVisible = false

const push_to = () => {
  let param = window.location.hash.split("/").pop()
  if(param === "posts"){
    rightVisible = false
  }else{
    push("/posts")
  }
}

const onjustify = (param, value) => {
  Object.keys(justify).map((key) => {
    justify[key] = key === param ? value : false;
  });
}

const logout = () => {
  $tk ="null"
  $cp = ""
  $uName = ""
  $uNo = ""
  push("/")
}

onMount(() => {
  /**
   * loop logo
   */
	const ctx = canvas.getContext('2d');
  let frame;
  (function loop() {
    frame = requestAnimationFrame(loop);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let p = 0; p < imageData.data.length; p += 4) {
      const i = p / 4;
      const x = i % canvas.width;
      const y = i / canvas.height >>> 0;
      const t = window.performance.now();
      const r = 64 + (128 * x / canvas.width) + (64 * Math.sin(t / 1000));
      const g = 64 + (128 * y / canvas.height) + (64 * Math.cos(t / 1400));
      const b = 128;
      imageData.data[p + 0] = r;
      imageData.data[p + 1] = g;
      imageData.data[p + 2] = b;
      imageData.data[p + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }());
  return () => {
    cancelAnimationFrame(frame);
  };
})

onMount(async () => {
  const result = await api.getDecodeUser($tk)
  if(result == null){
    console.log(result)
    alert("Please login")
    $tk ="null"
    $cp = ""
    $uName = ""
    $uNo = ""
    push("/")
  }
})
</script>

<style>
canvas {
  width: 7%;
  height: 7%;
  -webkit-mask: url("/img/svelte-logo-mask.svg") 50% 50% no-repeat;
  mask: url("/img/svelte-logo-mask.svg") 50% 50% no-repeat;
}
svg{
  fill: white;
}
</style>