import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import { Routes, Route, Navigate, useLocation, } from 'react-router-dom';
import Header from './components/Header';
import PostPage from './pages/PostPage';
import Auth from './pages/Auth';
import HomePage from './pages/HomePage';
import { useRecoilValue } from 'recoil';
import userAtom from './atoms/userAtom';
import UpdateProfilPage from './pages/UpdateProfilPage';
import UserPage from './pages/UserPage';
import CreatePost from './components/CreatePost';
import ChatPage from './pages/ChatPage';
import { FrozenPage } from './pages/FrozenPage';
const App = () => {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation(); // fetch path ...ie. after / if u write any thing it takes that path
  return (
    <Box position={"relative"} w='full'>
      <Container maxW={pathname === "/" ? { base: "550px", md: "700px" } : "550px"}>
        <Header />
        <Routes>
          <Route path='/' element={user ? <HomePage /> : <Navigate to='/auth' />} />
          <Route path='/auth' element={!user ? <Auth /> : <Navigate to='/' />} />
          <Route path='/update' element={user ? <UpdateProfilPage /> : <Navigate to='/auth' />} />
          <Route
            path='/:username'
            element={           //if u re logged in user then u have shows two component userpage and create post..but if u are not login then 
              user ? (         // u only show userpage/.....u dont have permision to cretet post
                <>
                  <UserPage />
                  <CreatePost />
                </>
              ) : (
                <UserPage />
              )
            }
          />
          <Route path='/:username/post/:pid' element={<PostPage />} />
          <Route path='/chat' element={user ? <ChatPage /> : <Navigate to={"/auth"} />} />
          <Route path='/settings' element={user ? <FrozenPage /> : <Navigate to={"/auth"} />} />
        </Routes>

      </Container>
    </Box>

  );
};

export default App;
