import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from "./layout/Layout"
import { Suspense } from "react"
import IndexPage from "./views/IndexPage"
import ChatPage from "./views/ChatPage"


function AppRouter() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={
            <Suspense fallback="Cargando...">
              <IndexPage/>
            </Suspense>
          } index/>

          <Route path="/chat" element={
            <Suspense fallback="Cargando...">
              <ChatPage/>
            </Suspense>
          }/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
