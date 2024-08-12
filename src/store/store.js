import {writable} from "svelte/store"

const store_token = sessionStorage.getItem("tk")
const store_company = sessionStorage.getItem("cp")
const store_userNo = sessionStorage.getItem("uNo")
const store_userName = sessionStorage.getItem("uName")
const store_uId = sessionStorage.getItem("uId")
const store_no = sessionStorage.getItem("no")

export const tk = writable(store_token)
export const cp = writable(store_company)
export const uNo = writable(store_userNo)
export const uName = writable(store_userName)
export const uId = writable(store_uId)
export const post_no = writable(store_no)

tk.subscribe(value => {
  sessionStorage.setItem("tk", value)
})
cp.subscribe(value => {
  sessionStorage.setItem("cp", value)
})
uNo.subscribe(value => {
  sessionStorage.setItem("uNo", value)
})
uName.subscribe(value => {
  sessionStorage.setItem("uName", value)
})
uId.subscribe(value => {
  sessionStorage.setItem("uId", value)
})
post_no.subscribe(value => {
  sessionStorage.setItem("post_no", value)
})


export const search = writable("")
export const offset = writable(0)
export const pageSize = writable(5)
