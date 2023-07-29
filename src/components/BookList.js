import useBookList from "../hooks/useBookList.js";
import { useState } from "react";
import styled from 'styled-components';
import {FallingLines} from "react-loader-spinner";
import {Navigate} from "react-router-dom";
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
         { downloadBook, emailBook, emailSentIndexes, emailSendingIndexes },
         { downloadProgress }] = useBookList();
  const [searchText, setSearchText] = useState('');
  const [selectedKindle, setSelectedKindle] = useState('ankit');
  const [searchLoading, setSearchLoading] = useState(false);

  if (!localStorage.getItem('loginUser') || !localStorage.getItem('loginPass')) {
    return <Navigate to='/login-page' />;
  }

  const checkEnterKeyClicked = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      search();
    }
  }

  const search = () => {
    setSearchLoading(true);
    getBookList(searchText, () => setSearchLoading(false));
  }

  const sendButton = (index) => {
    let buttonText = 'Send';
    let disabled = false;
    if (emailSendingIndexes.includes(index)) {
      buttonText = 'Sending';
      disabled = true;
    } else if (emailSentIndexes.includes(index)) {
      buttonText = 'Sent';
      disabled = true;
    }

    return <button
      onClick={() => emailBook(index, selectedKindle)}
      disabled={disabled}>
        {buttonText}
    </button>
  }
  return (<div>
    <input placeholder="Enter search term" onInput={e => setSearchText(e.target.value)} onKeyDown={checkEnterKeyClicked}/>
    <button onClick={search}>Get Book List</button>
    <br />
    {searchLoading ?
      <FallingLines
        color="#000000"
        width="100"
      /> : <List>
          <ListItem>
            <div>Title</div>
            <div>Series</div>
            <div>Author</div>
            <div>File Type</div>
            <div>Download</div>
            <div>Pick Kindle</div>
            <div>Send to Kindle</div>
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
              <div>{
                downloadProgress === -1 ?
                  <button onClick={() => downloadBook(index)}>Download</button> :
                  downloadProgress
              }</div>
              <div><select name="send-kindle" onChange={e => {
                setSelectedKindle(e.target.value);
              }}>
                <option value="ankit">
                  Ankit's Kindle
                </option>
                <option value="ankita">
                  Ankita's Kindle
                </option>
		<option value="anna">
		  Anna's Kindle
		</option>
              </select></div>
              <div>{sendButton(index)}</div>
            </ListItem>);
          })}
        </List>
      }
    </div>);
}

export default BookList;
