import {useEffect, useState} from "react";
import axios from "axios";
import {getAuthCookie} from "../utils/cookieHelper.js";

export default function useBookList() {
  const [bookList, setBookList] = useState([]);
  const [selectedFileIndexes, setSelectedFileIndexes] = useState([]);

  useEffect(() => {
    setSelectedFileIndexes(new Array(bookList.length).fill(0));
  }, [bookList]);
  const getBookList = (searchTerm) => {
    axios.get(`/book-list?searchTerm=${encodeURI(searchTerm)}`, {headers: {auth: getAuthCookie()}})
      .then(res => {
        if (res.data.data.length === 0) {
          alert('No results!');
        }
        setBookList(res.data.data);
      })
      .catch(e => console.error(e));
  }

  const downloadBook = (row) => {
    downloadAsync(row, '/download-book');
  }

  const downloadConvertBook = (row) => {
    downloadAsync(row, `/download-convert-book`);
  }

  const downloadAsync = (row, serverPath) => {
    const url = bookList[row].files[selectedFileIndexes[row]].links[0];
    const filename = bookList[row].title;
    const extension = bookList[row].files[selectedFileIndexes[row]].type.toLowerCase();
    const file = `${filename}.${extension}`;
    axios.get(`${serverPath}?bookUrl=${encodeURI(url)}`, {responseType: 'blob', headers: {auth: getAuthCookie()}})
      .then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${file}`);
        document.body.appendChild(link);
        link.click();
      })
      .catch(e => console.error(e));
  }
  const convertEmailBook = (row) => {
    const url = bookList[row].files[selectedFileIndexes[row]].links[0];
    axios.get(`/send-to-kindle?bookUrl=${encodeURI(url)}`, {responseType: 'blob', headers: {auth: getAuthCookie()}})
      .then(res => {
        console.log(res);
      })
      .catch(e => console.error(e));
  }


  const setSelectedFile = (rowIndex, fileIndex) => {
    const indexes = [...selectedFileIndexes];
    indexes[rowIndex] = fileIndex;
    setSelectedFileIndexes(indexes);
  }

  return [{ bookList, getBookList },
          { selectedFileIndexes, setSelectedFile },
          { downloadBook, downloadConvertBook, convertEmailBook }];
}