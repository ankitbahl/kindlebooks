import './App.css';

import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./components/Login.js";
import BookList from "./components/BookList.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/book-search" element={<BookList />} />
        <Route exact path="/login-page" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
