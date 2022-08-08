import useBookList from "../hooks/useBookList.js";
import { useState } from "react";
import styled from 'styled-components';
const List = styled.div`
  &> div:first-child {
    font-weight: bold;
  }
  
  &> div:nth-child(even) {
    background: lightgray;
  }
  
  width: 70em;
  display: flex;
  flex-direction: column;
`;

const ListItem = styled.div`
  &> div:nth-child(1) {
    width: 24%;
  }
  &> div:nth-child(2) {
    width: 15%;
  }
  &> div:nth-child(3) {
    width: 15%;
  }
  &> div:nth-child(4) {
    width: 10%;
  }
  &> div:nth-child(5) {
    width: 12%;
    padding: 0 10px;
  }

  &> div:nth-child(6) {
    width: 12%;
    padding: 0 10px;
  }

  &> div:nth-child(7) {
    width: 12%;
    padding: 0 10px;
  }

  font-weight: normal;
  padding: 10px;
  justify-content: space-between;
  display: flex;
  flex-direction: row;
`;

const BookList = () => {
  const [{ bookList, getBookList },
         { setSelectedFile },
         { downloadBook }] = useBookList();
  const [searchText, setSearchText] = useState('');

  // if (!localStorage.getItem('loginUser') || !localStorage.getItem('loginPass')) {
  //   return <Navigate to='/login-page' />;
  // }
  return (<div>
    <input placeholder="Enter search term" onInput={e => setSearchText(e.target.value)}/>
    <button onClick={() => getBookList(searchText)}>Get Book List</button>
      <List>
        <ListItem>
          <div>Title</div>
          <div>Series</div>
          <div>Author</div>
          <div>File Type</div>
          <div>Download</div>
          <div>Download Mobi</div>
          <div>Send Mobi to Kindle</div>
        </ListItem>
        {bookList.map((bookResult, index) => {
          return (<ListItem key={bookResult.title+';' + bookResult.author}>
            <div>{bookResult.title}</div>
            <div>{bookResult.series}</div>
            <div>{bookResult.author}</div>
            <div><select name="file-type" onChange={e => {
              setSelectedFile(index, e.target.value);
            }}>
              {bookResult.files.map((file, index) => {
                return (<option value={index} key={index}>
                  {file.type} - {file.size}
                </option>);
              })}
            </select></div>
            <div><button onClick={() => downloadBook(index)}>Download</button></div>
            <div><button>Convert and Download</button></div>
            <div><button>Convert and Send</button></div>
          </ListItem>);
        })}
      </List>
    </div>);
}

export default BookList;