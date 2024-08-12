import axios from "axios"

const host = {
  API_URL: "http://localhost:8090/graphql"
}

export default {
  login: async (id, pw)=>{
    try {
      const result = await axios.post(host.API_URL,{
        query: `
              mutation{
                login(userId:"${id}",password:"${pw}"){
                  token
                  user{
                    no
                    corpId
                    company
                    userId
                    userName
                  }
                }
              }
            `
      })
      return result.data.data.login
    } catch (err) {
      throw new Error("login Error: ", err)
    }
  },

  getPost: async (company, curPage, searchValue, pageSize)=>{
    try {
      const result = await axios.post(host.API_URL,{
        query:`
            query{
              getPostsByCorpPaging(category:"${company}", curPage:${curPage}, search:"${searchValue}", pageSize:${pageSize}){
                post{
                  no
                  num
                  title
                  contents
                  writer
                  createdDate
                  modifiedDate
                }
                paging{
                  curPage
                  page_list_size
                  page_size
                  totalPage
                  startPage
                  endPage
                  no
                  totalCount
                }
              }
            }
        `
      })
      return result.data.data.getPostsByCorpPaging
    } catch (err) {
      throw new Error("get post Error: ", err)
    }
  },

  savePost: async (title, contents, uId, uName, cp)=>{
    try{
      const result = await axios.post(host.API_URL,{
        query:`
            query{
                insertPost(
                    userId: "${uId}"
                    title: "${title}"
                    contents: "${contents}"
                    files: null
                    writer: "${uName}"
                    counter: null
                    category: "${cp}")
                    {
                    resultCount
                }
            }
        `
      })
      return result.data.data.insertPost.resultCount
    } catch (err) {
      throw new Error("savePost Error: ", err)
    }
  },

  detailPost: async (id)=>{
    try {
      const result = await axios.post(host.API_URL,{
        query:`
            query{
              readPost(no: ${id}){
                post{
                  title
                  userId
                  writer
                  contents
                  category
                  createdDate
                  modifiedDate
                }
                coments{
                  no
                  coment
                  userId
                  writer
                  createdDate
                  modifiedDate
                }
              }
            }
        `
      })
      return result.data.data.readPost
    } catch (err) {
      throw new Error("detailPost Error: ", err)
    }
  },

  updatePost: async (No, Title, Contents, uId)=>{
    try {
      const result = await axios.post(host.API_URL,{
        query:`
            query{
              updatePost(
                no: "${No}"
                title: "${Title}"
                contents: "${Contents}"
                uid: "${uId}"
                ){
                resultCount
              }
            }
        `
      })
      return result.data.data.updatePost.resultCount
    } catch (err) {
      throw new Error("updatePost Error: ", err)
    }
  },

  getDecodeUser: async (token)=>{
    try {
      const result = await axios.post(host.API_URL,{
        query:`
            mutation{
                getDecodeToken(token:"`+token+`"){
                    no
                    userName
                    company
                    userEmail
                    userMobile
                    userId
                }
            }
        `
      })
      return result.data.data.getDecodeToken
    } catch (err) {
      throw new Error("getDecodeUser Error: ", err)
    }
  },

  updateUser: async (no, name, email, id, phone, password)=>{
    try {
      const result = await axios.post(host.API_URL,{
        query: `
          mutation{
              updateUser(
                  no:${no}
                  userName:"${name}"
                  userEmail:"${email}"
                  userMobile:"${phone}"
                  userPW:"${password}"
                  userId:"${id}"
              ){
                  resultCount
              }
          }
        `
      })
      return result.data.data.updateUser.resultCount
    } catch (err) {
      throw new Error("updateUser Error: ", err);
    }
  },

  saveComent: async (no, comentVal, uId, writer)=>{
    try {
      const result = await axios.post(host.API_URL,{
        query: `
          mutation{
            insertComent(
                postId: "${no}"
                coment: "${comentVal}"
                uId: "${uId}"
                writer: "${writer}"
              ){
                  resultCount
              }
          }
        `
      })
      return result.data.data.insertComent.resultCount
    } catch (err) {
      throw new Error("insertComent Error: ", err);
    }
  },

  deletePost: async (no)=>{
    try {
      const result = await axios.post(host.API_URL,{
        query: `
          query{
            deletePost(
                no: ${no}
              ){
                  resultCount
              }
          }
        `
      })
      return result.data.data.deletePost.resultCount
    } catch (err) {
      throw new Error("deletePost Error: ", err);
    }
  },

  deleteComent: async (no)=>{
    try {
      const result = await axios.post(host.API_URL,{
        query: `
          mutation{
            deleteComent(
                no: ${no}
              ){
                  resultCount
              }
          }
        `
      })
      return result.data.data.deleteComent.resultCount
    } catch (err) {
      throw new Error("deleteComent Error: ", err)
    }
  }

  
}
